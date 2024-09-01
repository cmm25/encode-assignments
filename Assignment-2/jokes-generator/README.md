## Jokes Generator Project

This markdown provides an overview of the **Jokes Generator** project, a versatile, interactive, and real-time joke generation tool. The application allows users to generate customized jokes based on selected **topics**, **tones**, **joke types**, **languages**, and a **creativity** level.

<video width="100%" controls>
  <source src="illustration.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### 1. Project Overview

The Jokes Generator is built using **Next.js** and integrates with the **OpenAI GPT-4 API** to dynamically generate jokes in real time. It offers users various customization options such as selecting the topic, tone, joke type, and even the language in which the joke is generated. The user interface is responsive, with real-time feedback and a creative joke evaluation feature.

### 2. Core Technologies

- **Next.js**: A React framework used for building the frontend, handling routing, and managing the serverless API routes.
- **OpenAI GPT-4**: Provides joke generation capabilities through OpenAI’s API, allowing the system to respond to user input with custom jokes.
- **TypeScript**: For type safety and better tooling during development.
- **React**: Used to build the component-based UI, allowing stateful interactions.
- **Tailwind CSS**: Provides utility-first styling for rapid development of the interface.

### 3. Key Components

#### 3.1 API Interaction (`POST` Endpoint)

The backend uses the `OpenAIStream` and `StreamingTextResponse` to stream the joke output from the OpenAI GPT-4 API in real time. The request to OpenAI is constructed with the following dynamic parameters:

- **`messages`**: Passed from the frontend to retain conversation context.
- **`topic`**: The user-specified joke topic.
- **`tone`**: Adjusts the tone of the joke (e.g., witty, sarcastic, etc.).
- **`jokeType`**: Defines the type of joke (e.g., pun, knock-knock, etc.).
- **`language`**: Specifies the language for the joke generation.
- **`temperature`**: Controls the creativity of the response.

The backend constructs a user prompt to request a joke based on these parameters, then streams the joke to the client using the `OpenAIStream`.

#### 3.2 Frontend (React Components)

The **React** frontend allows users to interact with various input fields to customize the joke generation experience. Here’s a breakdown of the core components:

1. **Topic Selector**: A dropdown that lets users choose from different joke topics such as "work," "people," "animals," etc.
2. **Tone Selector**: Allows the user to select the tone of the joke (e.g., witty, sarcastic, dark, etc.).
3. **Joke Type Selector**: Offers users the option to generate a specific type of joke, such as a pun, knock-knock joke, or story.
4. **Language Selector**: Users can choose from multiple languages (English, Chinese, Spanish, etc.) for the generated joke.
5. **Creativity Slider**: A slider input that adjusts the temperature value, allowing users to control how creative or predictable the joke should be.

#### 3.3 Joke Display and Evaluation

Once the joke is generated, the text is displayed in a **card** component. To enhance user engagement, the joke is revealed letter-by-letter using a timed interval, simulating a typing effect. The joke is also evaluated based on keywords, and the results are categorized into one of several types: "Funny," "Mildly Offensive," "Appropriate," etc.

### 4. Code Breakdown

#### 4.1 API Request

```ts
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

    const systemMessage = `You are a versatile and witty comedian specializing in generating diverse jokes...`;

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
```

- **GPT-4 API**: The function constructs a dynamic request to OpenAI's GPT-4, adjusting parameters like topic, tone, and language to customize the joke.
- **Streaming Response**: Jokes are streamed back to the frontend in real time to provide a smooth and engaging user experience.

#### 4.2 Joke Generation Component

```ts
const { messages, append, isLoading } = useChat();
const [topic, setTopic] = useState<Topic>("general");
const [tone, setTone] = useState<Tone>("witty");
const [jokeType, setJokeType] = useState<JokeType>("any");
const [temperature, setTemperature] = useState<number>(0.7);
const [language, setLanguage] = useState<Language>("en");

const handleGenerateJoke = async (): Promise<void> => {
  setJokeGenerated(false);
  setDisplayedJoke("");
  const userMessage: Message = {
    id: Date.now().toString(),
    role: "user",
    content: `Generate a ${tone} ${jokeType} joke about ${topic} in ${language}.`,
  };

  await append(userMessage, {
    options: {
      body: { temperature, topic, tone, jokeType, language },
    },
  });

  setJokeGenerated(true);
};
```

- **State Management**: Handles the user's input for joke customization.
- **Message Appending**: Sends the user’s request to the API and displays the generated joke.

#### 4.3 Joke Evaluation

```ts
const evaluateJoke = (joke: string): string => {
  const lowerCaseJoke = joke.toLowerCase();
  if (lowerCaseJoke.includes("offensive")) {
    return "Mildly Offensive";
  } else if (lowerCaseJoke.includes("funny")) {
    return "Funny";
  } else if (lowerCaseJoke.includes("appropriate")) {
    return "Appropriate";
  }
  return "Neutral";
};
```

- **Evaluation Logic**: Determines the joke type based on keywords and punctuation, ensuring the joke matches user expectations.

### 5. User Interface Design

The user interface is designed for a clean, intuitive experience. The combination of **Tailwind CSS** and **UI components** ensures a responsive design with minimal clutter.

- **Select Inputs**: Dropdown menus for topic, tone, joke type, and language.
- **Slider Input**: Adjusts the creativity level.
- **Generate Button**: Triggers the joke generation process.
- **Joke Card**: Displays the joke in a scrollable, responsive card component.
- **Real-time Typing Effect**: Jokes are displayed with a dynamic typing effect to enhance the experience.

### 6. Summary

The Jokes Generator is a dynamic and fun project leveraging the power of AI to generate custom jokes in real time. By offering various customization options and an interactive UI, this project creates an engaging experience for users, allowing them to explore humor across different tones, types, and topics.

### 7. Future Improvements

- **Multilingual Expansion**: More languages could be added for broader accessibility.
- **Advanced Joke Evaluation**: Machine learning could be employed to better categorize and evaluate the humor level of jokes.
- **User Authentication**: Allow users to save or share jokes they find particularly funny.

This project offers a unique blend of creativity and technology, making it both an engaging app and a demonstration of GPT-4’s capability to entertain.
