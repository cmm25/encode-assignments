# Animal Image Classification and AI Agent

This project is a web application built with **Next.js** on the frontend and **FastAPI** on the backend. It allows users to upload an image of an animal, which is then classified using a **Computer Vision model**. The application identifies the animal and provides additional information, such as whether the animal is dangerous, based on Wikipedia data. The backend integrates both the **AI agent** and **CLIP image classification** functions for detecting and classifying animals.

## Main Concepts

### 1. **Image Upload via Next.js Frontend**:

- The user can upload an image (preferably of an animal), which is then sent to the backend for processing. The frontend provides an intuitive interface with an image input and an upload button.

### 2. **Image Classification Using CLIP**:

- A **CLIP-based model** is used to classify the uploaded image. This powerful Computer Vision model can recognize a wide variety of animals by comparing the image to a set of predefined labels (at least 10 different animals). The classification returns the name of the detected animal.

### 3. **AI Agent for Animal Information**:

- After identifying the animal, an **AI agent** retrieves additional information from Wikipedia. This includes:

    - The animal’s name.
    - A brief description of the animal.
    - A determination of whether the animal is generally considered dangerous.

### 4. **FastAPI Backend**:

- The backend is built using **FastAPI** and handles image processing, communication with the CLIP model, and calls to the AI agent for gathering additional data. It returns the classification result along with relevant information to the frontend.

### 5. **Asynchronous Operations**:

- The project makes use of **asynchronous functions** to handle time-consuming tasks such as image uploads, model inference, and API requests. This ensures that multiple users can interact with the application concurrently without delays or blocking.

### 6. **Results Display on Frontend**:

- The results are displayed on the frontend, showing the animal’s name, a description from Wikipedia, and whether the animal is dangerous. This information is presented in a user-friendly way, with a link to further reading.

## Why CLIP Was Used and Its Importance

### Why CLIP?

1. **Multi-Modal Understanding**:
   CLIP is designed to process both images and text, which makes it perfect for matching an image of an animal with a set of textual labels (animal names). Unlike traditional models that only handle one type of data, CLIP understands both images and language, making it a flexible tool for image classification.

2. **Zero-Shot Learning**:
   CLIP allows for **zero-shot classification**, meaning it can identify images in categories it hasn’t explicitly been trained on. This feature was crucial for this project since we didn’t need to retrain CLIP specifically for animal classification. We simply provided a list of animal names, and CLIP matched the image to the closest label.

3. **Pre-Trained Model**:
   Since CLIP is pre-trained on a large dataset, it performed well out-of-the-box, eliminating the need for extensive training or fine-tuning on custom datasets.

### Why Learning CLIP Was Important.

- **Understanding Multi-Modal Models**: Learning how CLIP works provides valuable insight into the intersection of image and text processing, preparing developers for the growing field of multi-modal AI.
- **Efficient for Real-World Applications**: CLIP's zero-shot capabilities make it useful for projects where creating and training custom models is impractical.
- **Future-Proofing AI Skills**: Mastering CLIP prepares developers for the future of AI, where multi-modal models will play an increasingly important role.

---

## Project Implementation and Purpose

### Purpose:

The primary purpose of this project is to demonstrate how **Computer Vision** and **AI agents** can be integrated to create an intuitive application that helps users identify animals in uploaded images. By combining a visual classification model with external knowledge sources like Wikipedia, this project shows how AI can offer more than just image recognition — it can provide detailed insights about the animal, including potential danger to humans.

### Implementation Overview:

1. **Frontend**:
   - The frontend is built using **Next.js** and provides a simple user interface where the user can upload an image of an animal. After uploading, the image is sent to the backend for processing.

2. **Backend**:
   - The **FastAPI** backend is responsible for processing the uploaded image. It first uses the **CLIP model** to classify the animal based on the image, then calls an **AI agent** to retrieve more information from Wikipedia, such as the animal’s description and whether it is dangerous.

3. **Model and AI Agent**:
   - The **CLIP model** classifies the animal based on a pre-trained set of animal labels.
   - The **AI agent** uses the animal’s name to query Wikipedia and return relevant data about the animal, including its description and danger level.

4. **Output**:
   - The frontend displays the result: the animal’s name, a description from Wikipedia, and a message indicating whether the animal is dangerous. A link to the full Wikipedia page is also provided for further reading.

### Key Objectives:

- **User-Friendly Experience**: Provide an easy-to-use platform where users can upload images and quickly receive results.
- **Leveraging Pre-Trained Models**: Demonstrate how to use pre-trained models like CLIP to avoid the overhead of training from scratch.
- **AI-Assisted Insights**: Show how integrating an AI agent can enhance the capabilities of an image classification model by connecting it with external data sources like Wikipedia.

---
