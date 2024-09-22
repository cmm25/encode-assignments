from fastapi import fastAPI, file, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import CLIPModel, CLIPImageProcessor
from llama_index.llms import openai
from llama_index.agent.openai import OpenAIAgent
from llama_index.core.tools import function_tool
from llama_index.core import settings
from llama_index.tools.wikipedia import WikipediaToolSpec
import json
from labels import all_animal_labels, animal_classes


settings.llm = OpenAIAgent(model ="gpt-4o-mini")
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

def identify_animal(image_path):

    clip_model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14")
    clip_processor = CLIPModel.from_pretrained("openai/clip-vit-large-patch14")

    image = Image.open(image_path)

    inputs = clip_processor(text = all_animal_labels, image= image, tensors ='pt', padding = True)
    output = clip_model(**inputs)

    #normalize the vector results
    logits_per_image = output.logits_per_image
    probs = logits_per_image.softmax(dim=1)

    animal_name= all_animal_labels[probs.argmax().item()]

    inputs = clip_processor(text = animal_classes, image= image, tensors ='pt', padding = True)
    output = clip_model(**inputs)

    #normalize the vector results
    logits_per_image = output.logits_per_image
    probs = logits_per_image.softmax(dim=1)

    animal_safety = probs[0][0].item() > 0.5

    return animal_name, animal_safety

# agent functions
identify_image_tool = function_tool.from_defaults(fn=identify_animal)
get_animal_info_tool = function_tool.from_defaults(fn=obtain_animal_info)

agent = OpenAIAgent.from_tools(
    tools=[identify_image_tool, get_animal_info_tool],
    verbose=True
)

#make the api endpoints using fast api

app = fastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000"], #prone to change when hosted the frontend
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
) 

class AnimalRecognition():
    animalName: str
    confidence_score: float 
    description: str
    wikipediaUrl: str
    isDangerous: bool

@app.post("/animal-recognition")
async def animal_recognition( image: UploadFile = file(...)):
    image_data = await image.read() 
    response = agent.chat(f"""
        Analyze the following image and respond in JSON format:
        - animalName: the name of the animal, or "Unknown" if you can't identify it
        - confidence: a number between 0 and 1 indicating how confident you are in the identification
        - description: a brief description of the animal, or "No description available"
        - wikipediaUrl: the Wikipedia URL for the animal, or "No URL available"
        - isDangerous: boolean indicating if the animal is generally considered dangerous
    """, image=image_data)
    try:
        animal_info= json.loads(response)
    except json.JSONDecodeError:
        raise ValueError("invalid response format")
    return AnimalRecognition(
        animalName=animal_info.get("animalName", "Unknown"),
        confidence=animal_info.get("confidence", 0.5),
        description=animal_info.get("description", "No description available"),
        wikipediaUrl=animal_info.get("wikipediaUrl", "No URL available"),
        isDangerous=animal_info.get("isDangerous", False)
    )