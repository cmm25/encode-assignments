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
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Settings.llm = OpenAI(model ="gpt-4o-mini")
wikipedia_tool= WikipediaToolSpec()

def obtain_animal_info(animal_name):
    """
        Goal here is to use the name label obtained from the classification, load it in wiki and
        get the animal info
    """
    wikipedia_data = wikipedia_tool.load_data(animal_name, auto_suggest= False)
    wikipedia_answer = wikipedia_data.get("content","")

    return {
        "summary": wikipedia_answer[:1000]
    }

def identify_animal(image_data):
    """
    Identifies the animal in the given image data.
    """
    # If image_data is a string (file path), read the file as bytes
    if isinstance(image_data, str):
        try:
            with open(image_data, 'rb') as f:
                image_bytes = f.read()
        except Exception as e:
            logger.error(f"Error reading image file: {e}")
            return {"error": str(e)}
    elif isinstance(image_data, bytes):
        image_bytes = image_data
    else:
        logger.error("Invalid image_data type. Expected bytes or file path string.")
        return {"error": "Invalid image_data type. Expected bytes or file path string."}

    try:
        clip_model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14")
        clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14", clean_up_tokenization_spaces=True)

        image = Image.open(BytesIO(image_bytes))

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

        return {
            "animal_name": animal_name,
            "is_dangerous": is_dangerous,
            "confidence_score": confidence_score
        }
    except Exception as e:
        logger.error(f"Error in identify_animal: {e}")
        return {"error": str(e)}

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
    allow_origins = ["http://localhost:3000", "https://image-analysis-ai.vercel.app/"], #prone to change when hosted the frontend
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
) 

class AnimalRecognition(BaseModel):
    animalName: str
    confidence: float  
    description: str
    isDangerous: bool

@app.post("/classify")
async def recognize_animal(image: UploadFile = File(...)):
    # Save the uploaded image
    image_bytes = await image.read()
    with open("temp_image.jpg", "wb") as buffer:
        buffer.write(image_bytes)
    
    # Pass the binary data to the agent
    response = agent.chat(f"""Analyze this image: temp_image.jpg. Please respond in JSON format, including the following fields: 
    - animalName: the name of the animal, or "Unknown" if you can't identify it
    - confidence: a number between 0 and 1 indicating how confident you are in the identification
    - description: a brief description of the animal, or "No description available" if it's unknown
    - isDangerous: boolean indicating if the animal is generally considered dangerous

    If the identify_image function returns "some other animal" or "something else", use that exact phrase as the animalName. In this case, set confidence to a low value (e.g., 0.1), description to "No description available", and wikipediaUrl to "No URL available".

    If you can't identify the animal or if it's not a specific animal, follow the same instructions as above.""")
    
    # Parse the response
    response_text = str(response)
    json_start = response_text.rfind('```json')
    json_end = response_text.rfind('```')
    if json_start != -1 and json_end != -1:
        json_content = response_text[json_start+7:json_end].strip()
        try:
            animal_info = json.loads(json_content)
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            raise ValueError(f"JSON decode error: {e}")
        
        animal_name = animal_info.get("animalName", "Unknown")
        confidence = animal_info.get("confidence", 0.5)  
        description = animal_info.get("description", "No description available")
        is_dangerous = animal_info.get("isDangerous", False)
        return AnimalRecognition(
            animalName=animal_name,
            confidence=confidence,
            description=description,
            isDangerous=is_dangerous
        )
    else:
        logger.error("Unable to parse JSON content from the response")
        raise ValueError("Unable to parse JSON content from the response")
    

"""
    below is an alternative way to do the same without the use of an ai agent thus llama_index.
"""

# import logging
# import warnings
# from fastapi import FastAPI, File, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# from PIL import Image
# from pydantic import BaseModel
# from transformers import CLIPModel, CLIPProcessor
# from io import BytesIO
# import wikipedia
# from labels import all_animal_labels, animal_classes
# from wikipedia.exceptions import DisambiguationError, PageError

# # Suppress specific warnings
# warnings.filterwarnings("ignore", category=FutureWarning, module='transformers')
# warnings.filterwarnings("ignore", category=UserWarning, module='wikipedia')

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class AnimalRecognition(BaseModel):
#     animalName: str
#     confidence: float
#     description: str
#     isDangerous: bool

# try:
#     clip_model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14")
#     clip_processor = CLIPProcessor.from_pretrained(
#         "openai/clip-vit-large-patch14",
#         clean_up_tokenization_spaces=True  
#     )
#     logger.info("CLIP model and processor initialized successfully.")
# except Exception as e:
#     logger.error(f"Failed to initialize CLIP model and processor: {e}")
#     raise e

# def obtain_animal_info(animal_name: str, max_sentences: int = 2):
#     try:
#         page = wikipedia.page(animal_name, auto_suggest=False, redirect=True)
#         summary = page.summary
#         # Limit the summary
#         limited_summary = ' '.join(summary.split('. ')[:max_sentences]) + '.'
#         return {
#             "summary": limited_summary
#         }
#     except DisambiguationError as e:
#         logger.warning(f"Disambiguation error for '{animal_name}': {e.options}")
#         try:
#             selected_option = e.options[0]
#             page = wikipedia.page(selected_option, auto_suggest=False, redirect=True)
#             summary = page.summary
#             limited_summary = ' '.join(summary.split('. ')[:max_sentences]) + '.'
#             logger.info(f"Resolved disambiguation by selecting '{selected_option}'.")
#             return {
#                 "summary": limited_summary
#             }
#         except Exception as ex:
#             logger.error(f"Error resolving disambiguation for '{animal_name}': {ex}")
#             return {
#                 "summary": "Multiple entries found."
#             }
#     except PageError:
#         logger.error(f"Page not found for '{animal_name}'.")
#         return {
#             "summary": "No description available."
#         }
#     except Exception as e:
#         logger.error(f"Unexpected error in obtain_animal_info: {e}")
#         return {
#             "summary": "No description available."
#         }
# def identify_animal(image_bytes: bytes):
#     try:
#         image = Image.open(BytesIO(image_bytes)).convert("RGB")

#         # animal name
#         inputs = clip_processor(text=all_animal_labels, images=image, return_tensors='pt', padding=True)
#         outputs = clip_model(**inputs)
#         logits_per_image = outputs.logits_per_image
#         probs = logits_per_image.softmax(dim=1)
#         animal_name = all_animal_labels[probs.argmax().item()]
#         confidence = probs.max().item()

#         # if dangerous
#         inputs = clip_processor(text=animal_classes, images=image, return_tensors='pt', padding=True)
#         outputs = clip_model(**inputs)
#         logits_per_image = outputs.logits_per_image
#         probs = logits_per_image.softmax(dim=1)
#         is_dangerous = probs[0][0].item() > 0.5

#         logger.info(f"Identified Animal: {animal_name} with confidence {confidence}")
#         return {
#             "animal_name": animal_name,
#             "is_dangerous": is_dangerous,
#             "confidence_score": confidence
#         }
#     except Exception as e:
#         logger.error(f"Error in identify_animal: {e}")
#         return {"error": str(e)}

# @app.post("/classify", response_model=AnimalRecognition)
# async def recognize_animal(image: UploadFile = File(...)):
#     try:
#         image_bytes = await image.read()
#         result = identify_animal(image_bytes)

#         if "error" in result:
#             raise ValueError(result["error"])

#         animal_name = result.get("animal_name", "Unknown")
#         confidence = result.get("confidence_score", 0.5)
#         is_dangerous = result.get("is_dangerous", False)

#         if animal_name.lower() in ["some other animal", "something else"]:
#             return AnimalRecognition(
#                 animalName=animal_name,
#                 confidence=0.1,
#                 description="No description available.",
#                 isDangerous=False
#             )
#         animal_info = obtain_animal_info(animal_name, max_sentences=2)  

#         return AnimalRecognition(
#             animalName=animal_name,
#             confidence=confidence,
#             description=animal_info.get("summary", "No description available."),
#             isDangerous=is_dangerous
#         )

#     except ValueError as ve:
#         logger.error(f"ValueError: {ve}")
#         return AnimalRecognition(
#             animalName="Unknown",
#             confidence=0.1,
#             description="No description available.",
#             isDangerous=False
#         )
#     except Exception as e:
#         logger.error(f"Unexpected error: {e}")
#         return AnimalRecognition(
#             animalName="Unknown",
#             confidence=0.1,
#             description="No description available.",
#             isDangerous=False
#         )