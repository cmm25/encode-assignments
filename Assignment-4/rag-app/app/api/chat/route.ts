import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,});


export const runtime = "edge";

export async function POST(req: Request) {
    const {
        messages,
        tone = "witty",
        setting = "forest",
        characters = [],
        language = "en",
        temperature = 0.8
    } = await req.json();

    const systemMessage = `You are a master storyteller known for creating engaging narratives in various settings.
    Your stories should be rich in detail, capturing the essence of the setting and characters, while being easy to understand in the specified language.
    Be creative, imaginative, and tailor the story to the chosen tone and setting.
    Don't self-censor too much - push the boundaries of storytelling while avoiding extremely offensive content.
    Always strive to match the requested tone and setting, even if it means being a bit edgy or fantastical.`;

    interface Character {
        name: string;
        description: string;
        personality: string;
    }

    const characterPrompts = characters.map((c: Character) => `${c.name}: ${c.description}. Personality: ${c.personality}`).join('\n');

    const userPrompt = `Generate a ${tone} story set in a ${setting} in ${language}. The story should be engaging and immersive.
    Include the following characters in your story:
    ${characterPrompts}
    Be creative and don't hold back!.`;

    const apiMessages = [
        { role: "system", content: systemMessage },
        ...messages.slice(0, -1), // Include all previous messages except the last one
        { role: "user", content: userPrompt }
    ];

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        stream: true,
        temperature: temperature,
        messages: apiMessages,
        max_tokens: 1000,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
}