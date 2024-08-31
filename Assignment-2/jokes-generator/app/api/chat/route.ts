import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI();

export const runtime = "edge";

export async function POST(req: Request) {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        stream: true,
        messages: [
            {
                role: "system",
                content: `You are a witty comedian who specializes in generating jokes that fit various topics, tones, and styles. 
        You can create puns, knock-knock jokes, or short humorous stories. Each joke should any style you want eg appropriate, offensive, funny, calm , bland for general audiences. 
        You should adjust your joke style based on the provided tone and topic, and generate jokes that can be easily understood in the specified language.`,
            },
            ...messages,
        ],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
}