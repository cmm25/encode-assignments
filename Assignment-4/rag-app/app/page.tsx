"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useTheme } from "next-themes"
import ReactMarkdown from 'react-markdown'
import dynamic from 'next/dynamic'


const Select = dynamic(() => import('@/components/ui/select').then(mod => mod.Select), { ssr: false })
const Button = dynamic(() => import("@/components/ui/button").then(mod => mod.Button), { ssr: false })
const Input = dynamic(() => import("@/components/ui/input").then(mod => mod.Input), { ssr: false })
const Textarea = dynamic(() => import("@/components/ui/textarea").then(mod => mod.Textarea), { ssr: false })
const LinkedSlider = dynamic(() => import("@/components/ui/linkedslider").then(mod => mod.LinkedSlider), { ssr: false })
const Card = dynamic(() => import("@/components/ui/card").then(mod => mod.Card), { ssr: false })
const CardContent = dynamic(() => import("@/components/ui/card").then(mod => mod.CardContent), { ssr: false })
const CardHeader = dynamic(() => import("@/components/ui/card").then(mod => mod.CardHeader), { ssr: false })
const CardTitle = dynamic(() => import("@/components/ui/card").then(mod => mod.CardTitle), { ssr: false })

import { Moon, Sun, Upload, Wand2, Plus, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type Character = {
  id: number;
  name: string;
  description: string;
  personality: string;
};

type Setting = 'country-side' | 'city' | 'forest' | 'beach' | 'mountains' | 'space' | 'arctic';
type Tone = 'dark' | 'fantasy' | 'witty' | 'romantic' | 'scary' | 'comic' | 'mystery' | 'sci-fi';

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;
const DEFAULT_TEMPERATURE = 0.1;

export default function RAGStoryGenerator() {
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const { theme, setTheme } = useTheme();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [story, setStory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tone, setTone] = useState<Tone>('witty');
  const [setting, setSetting] = useState<Setting>('country-side');

  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE.toString());
  const [chunkOverlap, setChunkOverlap] = useState(DEFAULT_CHUNK_OVERLAP.toString());
  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE.toString());
  const [needsNewIndex, setNeedsNewIndex] = useState(true);
  const [buildingIndex, setBuildingIndex] = useState(false);
  const [topK, setTopK] = useState<string>('5');
  const [topP, setTopP] = useState<string>('0.95');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChunkOverlapChange = useCallback((value: string) => {
    setChunkOverlap(value);
    setNeedsNewIndex(true);
  }, []);

  const extractCharactersFromText = useCallback(async () => {
    if (!text) {
      alert('Please upload a file first');
      return;
    }

    setIsExtracting(true);
    setBuildingIndex(true);

    try {
      const response = await fetch('/api/split', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document: text,
          chunkSize: parseInt(chunkSize),
          chunkOverlap: parseInt(chunkOverlap),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const extractedCharacters = await response.json();
      console.log('Extracted characters:', extractedCharacters);

      // Process the extracted characters
      const formattedCharacters = extractedCharacters.flatMap((charArray: Character[], index: number) =>
        charArray.map((char: Character) => ({
          id: index + 1,
          name: char.name || `Character ${index + 1}`,
          description: char.description || 'No description available',
          personality: char.personality || 'No personality traits specified',
        }))
      );

      setCharacters(formattedCharacters);
      setNeedsNewIndex(false);
    } catch (error) {
      console.error("Error extracting characters:", error);
      alert('An error occurred while extracting characters');
    } finally {
      setIsExtracting(false);
      setBuildingIndex(false);
    }
  }, [text, chunkSize, chunkOverlap]);

  const formatStory = (rawStory: string) => {
    // Remove extra spaces and line breaks
    let formattedStory = rawStory.replace(/\s+/g, ' ').trim();
    
    // Fix word breaks
    formattedStory = formattedStory.replace(/(\w+)\s+(\w+)/g, (_, p1, p2) => {
      if (p1.length <= 2 || p2.length <= 2) {
        return p1 + p2;
      }
      return p1 + ' ' + p2;
    });

    // Format titles and subtitles
    formattedStory = formattedStory.replace(/([#]+)\s*([^#\n]+)/g, (_, hashes, title) => {
      return `\n\n${hashes} ${title.trim()}\n\n`;
    });

    // Ensure proper capitalization after periods
    formattedStory = formattedStory.replace(/\.\s+[a-z]/g, match => match.toUpperCase());

    // Add paragraph breaks
    formattedStory = formattedStory.replace(/\.\s+/g, '.\n\n');

    // Remove any remaining '\n' characters
    formattedStory = formattedStory.replace(/\\n/g, '');

    // Trim extra whitespace
    formattedStory = formattedStory.split('\n').map(line => line.trim()).join('\n');

    return formattedStory;
  };

  const generateStory = useCallback(async () => {
    setStory('Generating story...');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone,
          setting,
          characters,
          temperature: parseFloat(temperature),
          topK: parseInt(topK),
          topP: parseFloat(topP),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let storyContent = '';

      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        storyContent += chunk;
        const formattedStory = formatStory(storyContent);
        setStory(formattedStory);
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setStory('An error occurred while generating the story');
    }
  }, [tone, setting, characters, temperature, topK, topP]);


  const addCharacter = useCallback((character: Character) => {
    setCharacters(prevCharacters => [...prevCharacters, { ...character, id: Date.now() }])
  }, []);

  const updateCharacter = useCallback((updatedCharacter: Character) => {
    setCharacters(prevCharacters =>
      prevCharacters.map((char) =>
        char.id === updatedCharacter.id ? updatedCharacter : char
      )
    );
  }, []);

  const deleteCharacter = useCallback((id: number) => {
    setCharacters(prevCharacters => prevCharacters.filter(char => char.id !== id))
  }, []);

  const handleChunkSizeChange = useCallback((value: string) => {
    setChunkSize(value);
    setNeedsNewIndex(true);
  }, []);

  if (!mounted) {
    return null;
  }


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/plain') {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => setText(e.target?.result as string)
      reader.readAsText(selectedFile)
    } else {
      alert('Please upload a .txt file')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a0aecd] to-[#d0d8e8] p-4 transition-colors duration-200 dark:from-[#3a4358] dark:to-[#5b6882] sm:p-8">
      <Card className="mx-auto max-w-4xl bg-white/90 backdrop-blur-sm dark:bg-gray-700/90">
        <CardHeader className="flex flex-col items-center justify-between space-y-2 border-b border-[#a0aecd] pb-6 dark:border-[#a0aecd]/30 sm:flex-row sm:space-y-0">
          <CardTitle className="text-2xl font-bold text-[#000000] dark:text-[#a0aecd] sm:text-3xl">RAG Story Generator</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="border-[#a0aecd] bg-[#a0aecd]/20 text-[#000000] hover:bg-[#a0aecd]/30 dark:border-[#4a5a75] dark:bg-[#2a3548]/80 dark:text-[#e0e5f0] dark:hover:bg-[#3a475e]"
          >
            {theme === 'light' ? <Moon className="size-5" /> : <Sun className="size-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </CardHeader>
        <CardContent className="mt-6 space-y-8">
          {/* File upload section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#000000] dark:text-[#a0aecd]">
              Upload your book or text file
            </label>
            <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer items-center justify-center rounded-md border border-[#a0aecd] bg-[#a0aecd]/20 px-4 py-2 text-sm font-medium text-[#000000] shadow-sm transition-colors duration-200 hover:bg-[#a0aecd]/30 dark:border-[#a0aecd]/50 dark:bg-[#a0aecd]/10 dark:text-[#a0aecd] dark:hover:bg-[#a0aecd]/20"
              >
                <Upload className="mr-2 size-5" />
                Choose file
              </label>
              <span className="max-w-[200px] truncate text-sm text-[#000000] dark:text-[#a0aecd] sm:max-w-none">
                {file && 'name' in file ? file.name : 'No file chosen'}
              </span>
            </div>
          </div>

          {/* RAG parameter controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000] dark:text-[#a0aecd]">RAG Parameters</h3>
            <LinkedSlider
              label="Chunk Size:"
              description="The maximum size of the chunks we are searching over, in tokens."
              min={1}
              max={3000}
              step={1}
              value={chunkSize}
              onChange={handleChunkSizeChange}
            />
            <LinkedSlider
              label="Chunk Overlap:"
              description="The maximum amount of overlap between chunks, in tokens."
              min={1}
              max={600}
              step={1}
              value={chunkOverlap}
              onChange={handleChunkOverlapChange}
            />
            <LinkedSlider
              label="Top K:"
              description="The maximum number of chunks to return from the search."
              min={1}
              max={15}
              step={1}
              value={topK}
              onChange={setTopK}
            />
            <LinkedSlider
              label="Temperature:"
              description="Controls the randomness of the output. Lower values make the output more focused and deterministic."
              min={0}
              max={1}
              step={0.01}
              value={temperature}
              onChange={setTemperature}
            />
            <LinkedSlider
              label="Top P:"
              description="An alternative to temperature, also known as nucleus sampling."
              min={0}
              max={1}
              step={0.01}
              value={topP}
              onChange={setTopP}
            />
          </div>


          <Button
            disabled={!needsNewIndex || buildingIndex}
            onClick={extractCharactersFromText}
            className="w-full bg-[#a0aecd] text-[#000000] transition-colors duration-200 hover:bg-[#8a9ab9] dark:bg-[#a0aecd]/80 dark:text-[#000000] dark:hover:bg-[#a0aecd]"
          >
            {isExtracting ? 'Extracting...' : 'Extract Characters'}
            <Wand2 className="ml-2 size-5" />
          </Button>

          {/* Characters table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000] dark:text-[#a0aecd]">Characters</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#000000] dark:text-[#a0aecd]">Name</TableHead>
                  <TableHead className="text-[#000000] dark:text-[#a0aecd]">Description</TableHead>
                  <TableHead className="text-[#000000] dark:text-[#a0aecd]">Personality</TableHead>
                  <TableHead className="text-[#000000] dark:text-[#a0aecd]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {characters.map((char) => (
                  <TableRow key={char.id}>
                    <TableCell className="text-[#000000] dark:text-[#a0aecd]">{char.name}</TableCell>
                    <TableCell className="text-[#000000] dark:text-[#a0aecd]">{char.description}</TableCell>
                    <TableCell className="text-[#000000] dark:text-[#a0aecd]">{char.personality}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCharacter(char)}
                          className="border-[#a0aecd] text-[#000000] dark:border-[#a0aecd]/50 dark:text-[#a0aecd]"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCharacter(char.id)}
                          className="border-[#a0aecd] text-[#000000] dark:border-[#a0aecd]/50 dark:text-[#a0aecd]"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#a0aecd] text-[#000000] hover:bg-[#8a9ab9] dark:bg-[#a0aecd]/80 dark:text-[#000000] dark:hover:bg-[#a0aecd]">
                <Plus className="mr-2 size-4" /> Add Character
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white text-[#000000] dark:bg-gray-800 dark:text-[#a0aecd]">
              <DialogHeader>
                <DialogTitle>{editingCharacter ? 'Edit Character' : 'Add New Character'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const character = {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  personality: formData.get('personality') as string,
                }
                if (editingCharacter) {
                  updateCharacter({ ...character, id: editingCharacter.id })
                } else {
                  addCharacter({ ...character, id: Date.now() })
                }
                e.currentTarget.reset()
              }}>
                <div className="space-y-4">
                  <Input
                    name="name"
                    placeholder="Character Name"
                    defaultValue={editingCharacter?.name}
                    className="bg-white text-[#000000] dark:bg-gray-700 dark:text-[#a0aecd]"
                  />
                  <Textarea
                    name="description"
                    placeholder="Character Description"
                    defaultValue={editingCharacter?.description}
                    className="bg-white text-[#000000] dark:bg-gray-700 dark:text-[#a0aecd]"
                  />
                  <Textarea
                    name="personality"
                    placeholder="Character Personality"
                    defaultValue={editingCharacter?.personality}
                    className="bg-white text-[#000000] dark:bg-gray-700 dark:text-[#a0aecd]"
                  />
                  <Button type="submit" className="bg-[#a0aecd] text-[#000000] hover:bg-[#8a9ab9] dark:bg-[#a0aecd]/80 dark:text-[#000000] dark:hover:bg-[#a0aecd]">
                    {editingCharacter ? 'Update Character' : 'Add Character'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          {/* Story settings section */}
          <section className='mb-8'>
            <h2 className="mb-4 text-2xl font-bold">Set your story parameters</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select value={setting} onValueChange={(value: Setting) => setSetting(value)}>
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
              <Select value={tone} onValueChange={(value: Tone) => setTone(value)}>
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
          {/* Generate story button */}
          <Button
            onClick={generateStory}
            disabled={characters.length === 0}
            className="w-full bg-[#a0aecd] text-[#000000] transition-colors duration-200 hover:bg-[#8a9ab9] dark:bg-[#a0aecd]/80 dark:text-[#000000] dark:hover:bg-[#a0aecd]"
          >
            Generate Story
          </Button>

          {/* Generated story section */}
          {story && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#000000] dark:text-[#a0aecd]">Generated Story</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{story}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}