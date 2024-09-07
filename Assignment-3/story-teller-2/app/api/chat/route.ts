import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Define the Character interface
interface Character {
    name: string;
    description: string;
    personality: string;
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const {
            prompt,
            messages,
            tone = "witty",
            setting = "forest",
            language = "en",
            characters = [] as Character[]
        } = await req.json();

        // Input validation
        if (typeof setting !== 'string' || typeof tone !== 'string' || typeof language !== 'string' || !Array.isArray(characters)) {
            return new Response(JSON.stringify({ error: "Invalid input parameters" }), { status: 400 });
        }

        const systemMessage = `You are a master storyteller known for creating engaging narratives in various settings such as forests, beaches, or even space.
        You write stories with a diverse range of tones, including witty, dark, romantic, or scary.
        Your stories should be rich in detail, capturing the essence of the setting and characters, while being easy to understand in the specified language.
        Be creative, imaginative, and tailor the story to the chosen tone and setting.`;

        const characterPrompts = characters.map((c: Character) => `${c.name}: ${c.description}. Personality: ${c.personality}`).join('\n');

        // Use provided prompt if available, otherwise construct it
        const userPrompt = prompt || `Generate a ${tone} story set in a ${setting} in ${language}. The story should be engaging and immersive.
        Include the following characters in your story:
        ${characterPrompts}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            stream: true,
            messages: [
                { role: "system", content: systemMessage },
                ...messages,
                { role: "user", content: userPrompt }
            ],
            max_tokens: 1000,
            presence_penalty: 0.6,
            frequency_penalty: 0.3,
        });

        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);
    } catch (error: unknown) {
        console.error('Error in story generation:', error);

        let errorMessage = "An error occurred while generating the story";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}