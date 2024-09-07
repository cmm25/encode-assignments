"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useChat } from "ai/react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Character {
  id: number;
  name: string;
  description: string;
  personality: string;
  background: string;
}

type Setting = 'country-side' | 'city' | 'forest' | 'beach' | 'mountains' | 'space' |'artic';
type Tone = 'dark' | 'fantasy' | 'witty' | 'romantic' | 'scary' | 'comic'| 'mystery'| 'sci-fi';

export default function Page() {
  const [tone, setTone] = useState<Tone>('witty');
  const [setting, setSetting] = useState<Setting>('country-side');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newCharacter, setNewCharacter] = useState<Omit<Character, 'id'>>({ name: '', description: '', personality: '', background: '' });
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [storyPrompt, setStoryPrompt] = useState('');
  const [characterSummaries, setCharacterSummaries] = useState<Record<string, string>>({});

  const { messages, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      generateCharacterSummaries(message.content);
    },
    onError: (error) => {
      console.error("Error in story generation:", error);
    },
  });

  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

  const addCharacter = () => {
    if (newCharacter.name && newCharacter.description && newCharacter.personality) {
      setCharacters([...characters, { ...newCharacter, id: Date.now() }]);
      setNewCharacter({ name: '', description: '', personality: '', background: '' });
    }
  };

  const editCharacter = (character: Character) => {
    setEditingCharacter(character);
  };

  const updateCharacter = () => {
    if (editingCharacter) {
      setCharacters(characters.map(c => c.id === editingCharacter.id ? editingCharacter : c));
      setEditingCharacter(null);
    }
  };

  const deleteCharacter = (id: number) => {
    setCharacters(characters.filter(c => c.id !== id));
  };

  const generateCharacterSummaries = (generatedStory: string) => {
    const summaries = characters.reduce((acc, character) => {
      const mentionCount = (generatedStory.match(new RegExp(character.name, 'gi')) || []).length;
      acc[character.name] = `${character.name} was mentioned ${mentionCount} times in the story. They played a ${mentionCount > 5 ? 'major' : 'minor'} role.`;
      return acc;
    }, {} as Record<string, string>);
    setCharacterSummaries(summaries);
  };

  const handleStorySubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
    const characterPrompts = characters.map(c => `${c.name}: ${c.description}. Personality: ${c.personality}`).join('\n');
    const fullPrompt = `Generate a ${tone} story set in the ${setting} with the following characters:\n${characterPrompts}\n\nStory prompt: ${storyPrompt}`;
    console.log("Submitting story generation request:", { tone, setting, characters, storyPrompt });
    handleSubmit(e, { 
      body: { 
        prompt: fullPrompt,
        tone,
        setting,
        characters,
        language: 'en'
      } 
    });
  }, [handleSubmit, tone, setting, characters, storyPrompt]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Storyteller AI</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Character Management</h2>

        {/* Add Character Form */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Character Name"
            value={newCharacter.name}
            onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <Select onValueChange={(value) => setNewCharacter({ ...newCharacter, personality: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Personality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brave">Brave</SelectItem>
              <SelectItem value="curious">Curious</SelectItem>
              <SelectItem value="mischievous">Mischievous</SelectItem>
              <SelectItem value="wise">Wise</SelectItem>
              <SelectItem value="silly">Silly</SelectItem>
              <SelectItem value="serious">Serious</SelectItem>
              <SelectItem value="corrupt">Corrupt</SelectItem>
              <SelectItem value="cunning">Cunning</SelectItem>
            </SelectContent>
          </Select>
          <textarea
            placeholder="Character Description"
            value={newCharacter.description}
            onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
            className="w-full p-2 border rounded"
            rows={3}
          />
          <textarea
            placeholder="Character Background"
            value={newCharacter.background}
            onChange={(e) => setNewCharacter({ ...newCharacter, background: e.target.value })}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        <Button onClick={addCharacter} className="w-full md:w-auto">Add Character</Button>

        {/* Character Table */}
        <div className="overflow-x-auto">
          <table className="w-full mt-4 border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Personality</th>
                <th className="border p-2">Background</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {characters.map((character) => (
                <tr key={character.id}>
                  <td className="border p-2">{character.name}</td>
                  <td className="border p-2">{character.description}</td>
                  <td className="border p-2">{character.personality}</td>
                  <td className="border p-2">{character.background}</td>
                  <td className="border p-2">
                    <Button onClick={() => editCharacter(character)} className="mr-2 mb-2">Edit</Button>
                    <Button onClick={() => deleteCharacter(character.id)} variant="destructive">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
  {/* Story Parameters Section */}
  <section className='mb-8'>
        <h2 className="text-2xl font-bold mb-4">Set your story parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select onValueChange={(value: Setting) => setSetting(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Story Setting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="country-side">Country-side</SelectItem>
              <SelectItem value="city">City</SelectItem>
              <SelectItem value="forest">Forest</SelectItem>
              <SelectItem value="beach">Beach</SelectItem>
              <SelectItem value="mountains">Mountains</SelectItem>
              <SelectItem value="space">Space</SelectItem>
              <SelectItem value="artic">Artic</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value: Tone) => setTone(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Story Tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="fantasy">Fantasy</SelectItem>
              <SelectItem value="witty">Witty</SelectItem>
              <SelectItem value="romantic">Romantic</SelectItem>
              <SelectItem value="scary">Scary</SelectItem>
              <SelectItem value="comic">Comic</SelectItem>
              <SelectItem value="mystery">Mystery</SelectItem>
              <SelectItem value="sci-fi">Sci-fi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Story Generation Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Story Generation</h2>
        <form onSubmit={handleStorySubmit} className="space-y-4">
          <textarea
            placeholder="Enter your story prompt here..."
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
          />
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? 'Generating...' : 'Generate Story'}
          </Button>
        </form>
        {error && (
          <div className="text-red-500 mt-2">
            Error: {error.message || "An error occurred while generating the story."}
          </div>
        )}
      </section>

      {/* Generated Story Section */}
      {messages.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Generated Story</h2>
          <div className="bg-gray-100 p-4 rounded">
            {messages.map((m, index) => (
              <div key={index} className="mb-4">
                <p>{m.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Character Summaries Section */}
      {Object.keys(characterSummaries).length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Character Summaries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(characterSummaries).map(([name, summary]) => (
              <div key={name} className="bg-gray-100 p-4 rounded">
                <h3 className="font-bold">{name}</h3>
                <p>{summary}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Edit Character Modal */}
      {editingCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Character</h3>
            <input
              type="text"
              value={editingCharacter.name}
              onChange={(e) => setEditingCharacter({ ...editingCharacter, name: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            />
            <textarea
              value={editingCharacter.description}
              onChange={(e) => setEditingCharacter({ ...editingCharacter, description: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              rows={3}
            />
            <Select onValueChange={(value) => setEditingCharacter({ ...editingCharacter, personality: value })}>
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Select Personality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brave">Brave</SelectItem>
                <SelectItem value="curious">Curious</SelectItem>
                <SelectItem value="mischievous">Mischievous</SelectItem>
                <SelectItem value="wise">Wise</SelectItem>
                <SelectItem value="silly">Silly</SelectItem>
                <SelectItem value="serious">Serious</SelectItem>
                <SelectItem value="corrupt">Corrupt</SelectItem>
              </SelectContent>
            </Select>
            <textarea
              value={editingCharacter.background}
              onChange={(e) => setEditingCharacter({ ...editingCharacter, background: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button onClick={updateCharacter}>Save</Button>
              <Button onClick={() => setEditingCharacter(null)} variant="outline">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}