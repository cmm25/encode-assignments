"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


interface Character {
  id: number;
  name: string;
  description: string;
  personality: string;
}

type Setting = 'country-side' | 'city' | 'forest' | 'beach' | 'mountains' | 'space';
type Tone = 'dark' | 'fantasy' | 'witty' | 'romantic' | 'scary' | 'comic';


export default function Page() {
  const [tone, setTone] = useState<Tone>('witty');
  const [setting, setSetting] = useState<Setting>('country-side');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newCharacter, setNewCharacter] = useState<Omit<Character, 'id'>>({ name: '', description: '', personality: '' });
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [storyPrompt, setStoryPrompt] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [characterSummaries, setCharacterSummaries] = useState<Record<string, string>>({});

  const addCharacter = () => {
    if (newCharacter.name && newCharacter.description && newCharacter.personality) {
      setCharacters([...characters, { ...newCharacter, id: Date.now() }]);
      setNewCharacter({ name: '', description: '', personality: '' });
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

  const generateStory = async () => {
    const characterPrompts = characters.map(c => `${c.name}: ${c.description}. Personality: ${c.personality}`).join('\n');
    
    const fullPrompt = `Generate a ${tone} story set in the ${setting} with the following characters:\n${characterPrompts}\n\nStory prompt: ${storyPrompt}`;
  
    // Simulating API call
    setGeneratedStory(`Here's a generated story based on your characters, tone, setting, and prompt: ${fullPrompt}`);
    const summaries = characters.reduce((acc, character) => {
      acc[character.name] = `${character.name} played a crucial role in the story...`;
      return acc;
    }, {} as Record<string, string>);
    setCharacterSummaries(summaries);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Storyteller AI</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Character Management</h2>

        {/* Add Character Form */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Character Name"
            value={newCharacter.name}
            onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            placeholder="Character Description"
            value={newCharacter.description}
            onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
            rows={3}
          />
          <Select onValueChange={(value) => setNewCharacter({ ...newCharacter, personality: value })}>
            <SelectTrigger className="mb-3">
              <SelectValue placeholder="Select Personality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brave">Brave</SelectItem>
              <SelectItem value="curious">Curious</SelectItem>
              <SelectItem value="mischievous">Mischievous</SelectItem>
              <SelectItem value="wise">Wise</SelectItem>
              <SelectItem value="silly">Silly</SelectItem>
              <SelectItem value="serious">Serious</SelectItem>
              <SelectItem value="funny">Corrupt</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addCharacter}>Add Character</Button>
        </div>

        {/* Character Table */}
        <table className="w-full mb-4 border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Personality</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {characters.map((character) => (
              <tr key={character.id}>
                <td className="border p-2">{character.name}</td>
                <td className="border p-2">{character.description}</td>
                <td className="border p-2">{character.personality}</td>
                <td className="border p-2">
                  <Button onClick={() => editCharacter(character)} className="mr-2 mb-2">Edit</Button>
                  <Button onClick={() => deleteCharacter(character.id)} variant="destructive">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className='mb-9'>
        <h2 className="text-2xl font-bold mb-4">Set your story parameters</h2>
        <Select onValueChange={(value: Setting) => setSetting(value)}>
          <SelectTrigger className="mb-3">
            <SelectValue placeholder="Select Story Setting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="country-side">Country-side</SelectItem>
            <SelectItem value="city">City</SelectItem>
            <SelectItem value="forest">Forest</SelectItem>
            <SelectItem value="beach">Beach</SelectItem>
            <SelectItem value="mountains">Mountains</SelectItem>
            <SelectItem value="space">Space</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value: Tone) => setTone(value)}>
          <SelectTrigger className="mb-3">
            <SelectValue placeholder="Select Story Tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="country-side">Dark</SelectItem>
            <SelectItem value="city">Fantasy</SelectItem>
            <SelectItem value="forest">Witty</SelectItem>
            <SelectItem value="beach">Romantic</SelectItem>
            <SelectItem value="mountains">Scary</SelectItem>
            <SelectItem value="space">Comic</SelectItem>
          </SelectContent>
        </Select>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Story Generation</h2>
        <textarea
          placeholder="Enter your story prompt here..."
          value={storyPrompt}
          onChange={(e) => setStoryPrompt(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
          rows={4}
        />
        <Button onClick={generateStory}>Generate Story</Button>
      </section>

      {/* Generated Story */}
      {generatedStory && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Generated Story</h2>
          <p>{generatedStory}</p>
        </section>
      )}

      {/* Character Summaries */}
      {Object.keys(characterSummaries).length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Character Summaries</h2>
          {Object.entries(characterSummaries).map(([name, summary]) => (
            <div key={name} className="mb-2">
              <h3 className="font-bold">{name}</h3>
              <p>{summary}</p>
            </div>
          ))}
        </section>
      )}

      {/* Edit Character Modal */}
      {editingCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
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
                <SelectItem value="funny">Corrupt</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={updateCharacter} className="mr-2">Save</Button>
            <Button onClick={() => setEditingCharacter(null)} variant="outline">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}