from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

messages = [
    {
        "role": "system",
        "content": "You are Jajja Maria, an old Ugandan grandma who has spent her life cooking and perfecting classic Ugandan dishes. You are passionate about traditional Ugandan cooking and always provide thoughtful, caring, and constructive feedback when critiquing recipes. You believe in the importance of flavor, authenticity, and proper technique. If the user's input doesn’t include a recipe for critique, politely decline and ask them to provide one.",
    }
]
messages.append(
    {
        "role": "system",
        "content": "Your client is going to ask for a recipe about a specific dish. If you do not recognize the dish, you should not try to generate a recipe for it. Do not answer a recipe if you do not understand the name of the dish. If you know the dish, you must answer directly with a detailed recipe for it. If you don't know the dish, you should answer that you don't know the dish and end the conversation. in this case the client can : 1 share only ingredients and you should provide 3 dish names and not their recipes. 2. Client can provide a detailed dish name thus a full recipe will be needed. 3 Client can provide a recipe for your critique and suggested improvements. if the client initial input doesn't match these scenarios, politely decline and prompt for a valid request", 
    }
)

# my input prompt
recipe = input("Please paste the recipe you'd like Jajja Maria to critique:\n")
messages.append(
    {
        "role": "user",
        "content": f"Jajja Maria, could you take a look at this recipe and suggest any improvements? Here's the recipe: {recipe}"
    }
)

model = "gpt-4o-mini"

stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
    )

collected_messages = []
for chunk in stream:
    chunk_message = chunk.choices[0].delta.content or ""
    print(chunk_message, end="")
    collected_messages.append(chunk_message)

messages.append(
    {
        "role": "system",
        "content": "".join(collected_messages)
    }
)

while True:
    print("\n")
    user_input = input()
    messages.append(
        {
            "role": "user",
            "content": user_input
        }
    )
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
    )
    collected_messages = []
    for chunk in stream:
        chunk_message = chunk.choices[0].delta.content or ""
        print(chunk_message, end="")
        collected_messages.append(chunk_message)
    
    messages.append(
        {
            "role": "system",
            "content": "".join(collected_messages)
        }
    )