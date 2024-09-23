import logging
import warnings
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel
from transformers import CLIPModel, CLIPProcessor
from io import BytesIO
import wikipedia
from labels import all_animal_labels, animal_classes
from wikipedia.exceptions import DisambiguationError, PageError

# Suppress specific warnings
warnings.filterwarnings("ignore", category=FutureWarning, module='transformers')
warnings.filterwarnings("ignore", category=UserWarning, module='wikipedia')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnimalRecognition(BaseModel):
    animalName: str
    confidence: float
    description: str
    isDangerous: bool

try:
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14")
    clip_processor = CLIPProcessor.from_pretrained(
        "openai/clip-vit-large-patch14",
        clean_up_tokenization_spaces=True  
    )
    logger.info("CLIP model and processor initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize CLIP model and processor: {e}")
    raise e

def obtain_animal_info(animal_name: str, max_sentences: int = 2):
    try:
        page = wikipedia.page(animal_name, auto_suggest=False, redirect=True)
        summary = page.summary
        # Limit the summary
        limited_summary = ' '.join(summary.split('. ')[:max_sentences]) + '.'
        url = page.url
        return {
            "summary": limited_summary,
            "url": url
        }
    except DisambiguationError as e:
        logger.warning(f"Disambiguation error for '{animal_name}': {e.options}")
        try:
            selected_option = e.options[0]
            page = wikipedia.page(selected_option, auto_suggest=False, redirect=True)
            summary = page.summary
            limited_summary = ' '.join(summary.split('. ')[:max_sentences]) + '.'
            url = page.url
            logger.info(f"Resolved disambiguation by selecting '{selected_option}'.")
            return {
                "summary": limited_summary,
                "url": url
            }
        except Exception as ex:
            logger.error(f"Error resolving disambiguation for '{animal_name}': {ex}")
            return {
                "summary": "Multiple entries found.",
                "url": "No URL available"
            }
    except PageError:
        logger.error(f"Page not found for '{animal_name}'.")
        return {
            "summary": "No description available.",
            "url": "No URL available"
        }
    except Exception as e:
        logger.error(f"Unexpected error in obtain_animal_info: {e}")
        return {
            "summary": "No description available.",
            "url": "No URL available"
        }
def identify_animal(image_bytes: bytes):
    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")

        # animal name
        inputs = clip_processor(text=all_animal_labels, images=image, return_tensors='pt', padding=True)
        outputs = clip_model(**inputs)
        logits_per_image = outputs.logits_per_image
        probs = logits_per_image.softmax(dim=1)
        animal_name = all_animal_labels[probs.argmax().item()]
        confidence = probs.max().item()

        # if dangerous
        inputs = clip_processor(text=animal_classes, images=image, return_tensors='pt', padding=True)
        outputs = clip_model(**inputs)
        logits_per_image = outputs.logits_per_image
        probs = logits_per_image.softmax(dim=1)
        is_dangerous = probs[0][0].item() > 0.5

        logger.info(f"Identified Animal: {animal_name} with confidence {confidence}")
        return {
            "animal_name": animal_name,
            "is_dangerous": is_dangerous,
            "confidence_score": confidence
        }
    except Exception as e:
        logger.error(f"Error in identify_animal: {e}")
        return {"error": str(e)}

@app.post("/classify", response_model=AnimalRecognition)
async def recognize_animal(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        result = identify_animal(image_bytes)

        if "error" in result:
            raise ValueError(result["error"])

        animal_name = result.get("animal_name", "Unknown")
        confidence = result.get("confidence_score", 0.5)
        is_dangerous = result.get("is_dangerous", False)

        if animal_name.lower() in ["some other animal", "something else"]:
            return AnimalRecognition(
                animalName=animal_name,
                confidence=0.1,
                description="No description available.",
                isDangerous=False
            )
        animal_info = obtain_animal_info(animal_name, max_sentences=2)  

        return AnimalRecognition(
            animalName=animal_name,
            confidence=confidence,
            description=animal_info.get("summary", "No description available."),
            isDangerous=is_dangerous
        )

    except ValueError as ve:
        logger.error(f"ValueError: {ve}")
        return AnimalRecognition(
            animalName="Unknown",
            confidence=0.1,
            description="No description available.",
            isDangerous=False
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return AnimalRecognition(
            animalName="Unknown",
            confidence=0.1,
            description="No description available.",
            isDangerous=False
        )