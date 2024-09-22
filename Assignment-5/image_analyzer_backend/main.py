from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel
from transformers import CLIPModel, CLIPProcessor
from llama_index.llms.openai import OpenAI
from llama_index.agent.openai import OpenAIAgent
from llama_index.core.tools import FunctionTool
from llama_index.core import Settings
from llama_index.tools.wikipedia import WikipediaToolSpec
from io import BytesIO
import json
from labels import all_animal_labels, animal_classes


Settings.llm = OpenAI(model ="gpt-4o-mini")
wikipedia_tool= WikipediaToolSpec()

def obtain_animal_info(animal_name):
    """
        Goal here is to use the name label obtained from the classification, load it in wiki and
        get the animal info
    """
    wikipedia_data = wikipedia_tool.load_data(animal_name, auto_suggest= False)
    wikipedia_answer = wikipedia_data.get("content","")

    wikipedia_url = wikipedia_data.get("url","")

    return {
        "summary": wikipedia_answer[:1000],
        "url": wikipedia_url
    }

def identify_animal(image_data):
    """
    Identifies the animal in the given image data.
    """
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14")
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")

    image = Image.open(BytesIO(image_data))

    inputs = clip_processor(text=all_animal_labels, images=image, return_tensors='pt', padding=True)
    outputs = clip_model(**inputs)

    # Normalize the vector results
    logits_per_image = outputs.logits_per_image
    probs = logits_per_image.softmax(dim=1)

    animal_name = all_animal_labels[probs.argmax().item()]

    inputs = clip_processor(text=animal_classes, images=image, return_tensors='pt', padding=True)
    outputs = clip_model(**inputs)

    logits_per_image = outputs.logits_per_image
    probs = logits_per_image.softmax(dim=1)

    is_dangerous = probs[0][0].item() > 0.5

    confidence_score = probs[0].max().item()

    return animal_name, is_dangerous, confidence_score
# agent functions
identify_image_tool = FunctionTool.from_defaults(fn=identify_animal)
get_animal_info_tool = FunctionTool.from_defaults(fn=obtain_animal_info)

agent = OpenAIAgent.from_tools(
    tools=[identify_image_tool, get_animal_info_tool],
    verbose=True
)

#make the api endpoints using fast api

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000"], #prone to change when hosted the frontend
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
) 

class AnimalRecognition(BaseModel):
    animalName: str
    confidence: float  
    description: str
    wikipediaUrl: str
    isDangerous: bool

@app.post("/classify")
async def recognize_animal(image: UploadFile = File(...)):
    # Save the uploaded image
    with open("temp_image.jpg", "wb") as buffer:
        buffer.write(await image.read())
    
    response = agent.chat("""Analyze this image: temp_image.jpg. Please respond in JSON format, including the following fields: 
    - animalName: the name of the animal, or "Unknown" if you can't identify it
    - confidence: a number between 0 and 1 indicating how confident you are in the identification
    - description: a brief description of the animal, or "No description available" if it's unknown
    - wikipediaUrl: the Wikipedia URL for the animal, or "No URL available" if it's unknown
    - isDangerous: boolean indicating if the animal is generally considered dangerous

    If the identify_image function returns "some other animal" or "something else", use that exact phrase as the animalName. In this case, set confidence to a low value (e.g., 0.1), description to "No description available", and wikipediaUrl to "No URL available".

    If you can't identify the animal or if it's not a specific animal, follow the same instructions as above.""")
    
    # parse the response
    response_text = str(response)
    json_start = response_text.rfind('```json')
    json_end = response_text.rfind('```')
    if json_start != -1 and json_end != -1:
        json_content = response_text[json_start+7:json_end].strip()
        animal_info = json.loads(json_content)

        animal_name = animal_info.get("animalName", "Unknown")
        confidence = animal_info.get("confidence", 0.5)  
        description = animal_info.get("description", "No description available")
        wikipedia_url = animal_info.get("wikipediaUrl", "No URL available")
        is_dangerous = animal_info.get("isDangerous", False)
        return AnimalRecognition(
            animalName=animal_name,
            confidence=confidence,
            description=description,
            wikipediaUrl=wikipedia_url,
            isDangerous=is_dangerous
        )
    else:
        raise ValueError("Unable to parse JSON content from the response")
    