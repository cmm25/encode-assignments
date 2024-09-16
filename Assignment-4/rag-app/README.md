# RAG Story Generator: Concept and User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Understanding RAG (Retrieval-Augmented Generation)](#understanding-rag)
3. [Project Overview](#project-overview)
4. [Setting Up the Project](#setting-up-the-project)
5. [Using the RAG Story Generator](#using-the-rag-story-generator)
6. [Customizing the Project](#customizing-the-project)
7. [Troubleshooting](#troubleshooting)
8. [Further Resources](#further-resources)

## Introduction

The **RAG Story Generator** is an innovative application that combines the power of language models with a novel approach to information retrieval and generation. Users can upload a text document (e.g., a story, novel, or article), and the application extracts characters or key entities from the text, generating creative stories or enhancing the original input.

## Understanding RAG

**Retrieval-Augmented Generation (RAG)** is a hybrid AI approach that enhances language models by incorporating external information into the generation process. The RAG Story Generator leverages this concept to extract details from text and use them as context for generating new stories. Here’s how it works in this project:

1. **Retrieval**: The system extracts relevant characters or entities from an uploaded text.
2. **Augmentation**: These extracted entities are then used to inform the generation process.
3. **Generation**: The language model generates creative content (such as a story) grounded in the extracted information.

This approach allows for unique, personalized story generation based on the input text.

## Project Overview

This project includes the following key components:

1. **Text Upload**: Users upload a `.txt` file containing any text (e.g., a story or document).
2. **Character Extraction**: The system processes the text and extracts characters or other entities.
3. **Story Parameters**: Users can define parameters for the story generation (e.g., tone, setting).
4. **Story Generation**: The system generates a unique story based on the characters and the defined parameters.

This project is located in the following folder of the repository:  
[**Assignment-4/rag-app**](https://github.com/cmm25/encode-assignments/tree/main/Assignment-4/rag-app).

## Setting Up the Project

Follow these steps to set up the project on your local machine:

1. Clone the repository:
   ```bash
   git clone https://github.com/cmm25/encode-assignments.git
   cd encode-assignments/Assignment-4/rag-app
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Set up your OpenAI API key:
   - Create a `.env.local` file in the root directory.
   - Add your OpenAI API key:
     ```bash
     OPENAI_API_KEY=your_api_key_here
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open the application in your browser at `http://localhost:3000`.

## Using the RAG Story Generator

1. **Upload a Text File**:
   - Click "Choose file" and select a `.txt` file containing any text (it could be a story, article, or even an essay). 

2. **Extract Characters or Key Entities**:
   - Once the document is uploaded, click "Extract Characters" to process the text.
   - The system extracts characters or entities from the text. These will appear in a list for review.

3. **Customize Extracted Characters or Entities** (optional):
   - You can manually edit, delete, or add additional characters/entities.

4. **Set Story Parameters**:
   - Define story elements such as tone (e.g., "mysterious", "romantic") or setting (e.g., "forest", "city").

5. **Generate Story**:
   - Click "Generate Story" to create a new narrative based on the extracted characters and defined parameters.

6. **Read and Enjoy**:
   - The generated story will be displayed in the "Generated Story" section, where you can read it.

## Customizing the Project

### Modifying RAG Parameters

You can adjust the parameters of the RAG system directly from the configuration:

- **Chunk Size**: The size of the text chunks processed during extraction.
- **Chunk Overlap**: The overlap between chunks to preserve context when extracting information.
- **Temperature**: Controls the creativity/randomness in story generation.
- **Top K** and **Top P**: Adjust how the language model chooses tokens during generation.

You can modify these parameters in the codebase.

### Adding New Story Settings or Tones

To add more settings or tones to the story generator:

1. Open the main component file in the `rag-app` folder.
2. Locate the `Select` components for settings and tones.
3. Add new options as `SelectItem` elements.

Example:
```jsx
<Select value={setting} onValueChange={(value) => setSetting(value)}>
  {/* Existing options */}
  <SelectItem value="underwater">Underwater</SelectItem>
</Select>
```

## Troubleshooting

- **API Key Issues**: Ensure your OpenAI API key is correctly set in the `.env.local` file.
- **Character Extraction Fails**: Make sure the uploaded text file is properly formatted and contains descriptive text.
- **Story Generation Errors**: Ensure characters are successfully extracted and story parameters are set before generating a story.

## Further Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Next.js Documentation](https://nextjs.org/docs)

For more detailed questions or support, feel free to open an issue in the repository.

--- 
