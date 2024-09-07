import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI();

export const runtime = "edge";

export async function POST(req: Request) {
    const {
        messages,
        topic = "general",
        tone = "witty",
        jokeType = "any",
        language = "en",
        temperature = 0.8
    } = await req.json();

    const systemMessage = `You are a versatile and witty comedian specializing in generating diverse jokes. 
    Your repertoire includes puns, knock-knock jokes, and short humorous stories. 
    Your jokes should span a range from appropriate to offensive, and from calm to hilarious. 
    Adjust your joke style based on the provided tone and topic, and ensure the jokes are easily understood in the specified language. 
    Be creative, surprising, and don't self-censor too much - push the boundaries of humor while avoiding extremely offensive content.
    Always strive to match the requested tone and type, even if it means being a bit edgy or silly.`;

    const userPrompt = `Generate a ${tone} ${jokeType === "any" ? "joke" : jokeType} about ${topic} in ${language}. Be creative and don't hold back!`;

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        stream: true,
        temperature: temperature,
        messages: [
            { role: "system", content: systemMessage },
            ...messages,
            { role: "user", content: userPrompt }
        ],
        max_tokens: 150,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
}