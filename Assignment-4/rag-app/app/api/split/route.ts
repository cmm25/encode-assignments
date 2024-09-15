// app/api/splitandembeded/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Document, VectorStoreIndex, serviceContextFromDefaults } from 'llamaindex';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


type Input = {
  document: string;
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  temperature: number;
  topP: number;
};

type Character = {
  name: string;
  description: string;
  personality: string;
};

type Output = {
  error?: string;
  characters?: Character[];
};

export async function POST(req: NextRequest) {
  try {
    const { document, chunkSize, chunkOverlap, topK, temperature, topP }: Input = await req.json();

    const nodes = await VectorStoreIndex.fromDocuments([new Document({ text: document })], {
      serviceContext: serviceContextFromDefaults({
        chunkSize,
        chunkOverlap,
      }),
    });

    const queryEngine = nodes.asQueryEngine();
    const response = await queryEngine.query(
      "Extract all characters from this text. For each character, provide their name, a brief description, and their personality traits."
    );

    const parseResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that parses unstructured text about characters into a structured JSON format.",
        },
        {
          role: "user",
          content: `Parse the following text into a JSON array of character objects, each with 'name', 'description', and 'personality' fields:\n\n${response.response}`,
        },
      ],
      temperature: 0.5,
    });

    const characters: Character[] = JSON.parse(parseResponse.choices[0].message.content || "[]");

    return NextResponse.json({ characters });
  } catch (error) {
    console.error("Error extracting characters:", error);
    return NextResponse.json({ error: "An error occurred while extracting characters" }, { status: 500 });
  }
}
