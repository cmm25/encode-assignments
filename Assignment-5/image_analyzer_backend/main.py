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
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

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
origins = [
    "http://localhost:3000",
    "https://image-analysis-ai.vercel.app",
    "https://image-analyzer-aygytniwb-cmm25s-projects.vercel.app"  
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
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
    try:
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
    except Exception as e:
        logger.error(f"Error in recognize_animal: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"},
        )
    

# Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTPException: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"ValidationError: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )