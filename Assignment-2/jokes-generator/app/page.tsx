"use client"

import React, { useState, useEffect, useRef } from "react"
import { useChat, Message } from "ai/react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Topic = "work" | "people" | "animals" | "food" | "television"
type Tone = "witty" | "sarcastic" | "silly" | "dark" | "goofy"
type JokeType = "pun" | "knockknock" | "story"
type Language = "en" | "zh" | "es" | "hi" | "ja" | "fr"

export default function JokesGenerator(): React.ReactElement {
  const { messages, append, isLoading } = useChat()
  const [topic, setTopic] = useState<Topic>("work")
  const [tone, setTone] = useState<Tone>("witty")
  const [jokeType, setJokeType] = useState<JokeType>("pun")
  const [temperature, setTemperature] = useState<number>(0.5)
  const [language, setLanguage] = useState<Language>("en")
  const [jokeGenerated, setJokeGenerated] = useState<boolean>(false)
  const [displayedJoke, setDisplayedJoke] = useState("")
  const jokeContainerRef = useRef<HTMLDivElement>(null)

  const handleGenerateJoke = async (): Promise<void> => {
    const userMessage: Message = {
      id: Date.now().toString(), 
      role: "user",
      content: `Generate a ${tone} ${jokeType} about ${topic} in ${language}. The joke should be well-structured and of any style appropriate,offensive, funny, calm , bland for general audiences.`,
    }

    await append(userMessage, {
      options: {
        temperature: temperature,
      }
    })
    setJokeGenerated(true)
    setDisplayedJoke("")
  }

  useEffect(() => {
    if (messages.length > 0 && jokeGenerated) {
      const joke = messages[messages.length - 1].content
      let index = 0
      const intervalId = setInterval(() => {
        if (index < joke.length) {
          setDisplayedJoke((prev) => prev + joke[index])
          index++
        } else {
          clearInterval(intervalId)
        }
      }, 50)

      return () => clearInterval(intervalId)
    }
  }, [messages, jokeGenerated])

  useEffect(() => {
    if (jokeContainerRef.current) {
      jokeContainerRef.current.scrollTop = jokeContainerRef.current.scrollHeight
    }
  }, [displayedJoke])

  const evaluateJoke = (joke: string): string => {
    if (joke.toLowerCase().includes("offensive")) {
      return "Offensive"
    } else if (joke.toLowerCase().includes("funny")) {
      return "Funny"
    } else {
      return "Appropriate"
    }
  }

  const jokeEvaluation = displayedJoke ? evaluateJoke(displayedJoke) : ""

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-4xl font-bold">Jokes Generator</h1>
        <div className="grid grid-cols-2 gap-4">
          <Select value={topic} onValueChange={(value: Topic) => setTopic(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="people">People</SelectItem>
              <SelectItem value="animals">Animals</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="television">Television</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tone} onValueChange={(value: Tone) => setTone(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="witty">Witty</SelectItem>
              <SelectItem value="sarcastic">Sarcastic</SelectItem>
              <SelectItem value="silly">Silly</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="goofy">Goofy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={jokeType} onValueChange={(value: JokeType) => setJokeType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Joke Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pun">Pun</SelectItem>
              <SelectItem value="knockknock">Knock-Knock</SelectItem>
              <SelectItem value="story">Story</SelectItem>
            </SelectContent>
          </Select>
          <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span>Creativity:</span>
          <Slider
            value={[temperature]}
            onValueChange={(value: number[]) => setTemperature(value[0])}
            min={0}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <span>{(temperature * 100).toFixed(0)}%</span>
        </div>
        <Button onClick={handleGenerateJoke} className="w-full" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Joke"}
        </Button>
        <Card className="h-64">
          <CardContent className="h-full p-0">
            <div ref={jokeContainerRef} className="h-full overflow-y-auto p-4 text-left whitespace-pre-wrap">
              {displayedJoke}
            </div>
          </CardContent>
        </Card>
        {jokeGenerated && displayedJoke && (
          <div className="mt-4 text-sm font-medium text-muted-foreground">Joke Evaluation: {jokeEvaluation}</div>
        )}
      </div>
    </div>
  )
}