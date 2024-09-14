'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "next-themes"
import { Moon, Sun, Upload, Wand2, Plus, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Character = {
  id: number;
  name: string;
  description: string;
  personality: string;
}

export function RagStoryGenerator() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedCharacters, setExtractedCharacters] = useState<string[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [characters, setCharacters] = useState<Character[]>([])
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [story, setStory] = useState('')
  const [characterSummaries, setCharacterSummaries] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'text/plain') {
      setFile(selectedFile)
    } else {
      alert('Please upload a .txt file')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const extractCharacters = async () => {
    if (!file) {
      alert('Please upload a file first')
      return
    }

    setIsExtracting(true)
    // Simulating character extraction process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      // This is a simple simulation. In a real scenario, you'd use NLP or other techniques
      const extractedNames = text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || []
      setExtractedCharacters(extractedNames)
    }
    reader.readAsText(file)
    setIsExtracting(false)
  }

  const addCharacter = (character: Omit<Character, 'id'>) => {
    setCharacters([...characters, { ...character, id: Date.now() }])
  }

  const updateCharacter = (updatedCharacter: Character) => {
    setCharacters(characters.map(char => 
      char.id === updatedCharacter.id ? updatedCharacter : char
    ))
    setEditingCharacter(null)
  }

  const deleteCharacter = (id: number) => {
    setCharacters(characters.filter(char => char.id !== id))
  }

  const generateStory = async () => {
    // Simulating story generation with AI
    setStory("Once upon a time...")
    const summaries: Record<string, string> = {}
    characters.forEach(char => {
      summaries[char.name] = `${char.name} played a crucial role in the story...`
    })
    setCharacterSummaries(summaries)
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-[#a0aecd] to-[#d0d8e8] dark:from-[#3a4358] dark:to-[#5b6882] transition-colors duration-200">
      <Card className="max-w-4xl mx-auto bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pb-6 border-b border-[#a0aecd] dark:border-[#a0aecd]/30">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-[#000000] dark:text-[#a0aecd]">RAG Story Generator</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="bg-[#a0aecd]/20 dark:bg-[#2a3548]/80 text-[#000000] dark:text-[#e0e5f0] hover:bg-[#a0aecd]/30 dark:hover:bg-[#3a475e] border-[#a0aecd] dark:border-[#4a5a75]"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-8 mt-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#000000] dark:text-[#a0aecd]">
              Upload your book or text file
            </label>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
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
                className="flex items-center justify-center px-4 py-2 border border-[#a0aecd] dark:border-[#a0aecd]/50 rounded-md shadow-sm text-sm font-medium text-[#000000] dark:text-[#a0aecd] bg-[#a0aecd]/20 dark:bg-[#a0aecd]/10 hover:bg-[#a0aecd]/30 dark:hover:bg-[#a0aecd]/20 cursor-pointer transition-colors duration-200"
              >
                <Upload className="mr-2 h-5 w-5" />
                Choose file
              </label>
              <span className="text-sm text-[#000000] dark:text-[#a0aecd] truncate max-w-[200px] sm:max-w-none">
                {file ? file.name : 'No file chosen'}
              </span>
            </div>
          </div>
          
          <Button 
            onClick={extractCharacters} 
            disabled={!file || isExtracting}
            className="w-full bg-[#a0aecd] hover:bg-[#8a9ab9] text-[#000000] dark:bg-[#a0aecd]/80 dark:hover:bg-[#a0aecd] dark:text-[#000000] transition-colors duration-200"
          >
            {isExtracting ? 'Extracting...' : 'Extract Characters'}
            <Wand2 className="ml-2 h-5 w-5" />
          </Button>
          
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
                          className="text-[#000000] dark:text-[#a0aecd] border-[#a0aecd] dark:border-[#a0aecd]/50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCharacter(char.id)}
                          className="text-[#000000] dark:text-[#a0aecd] border-[#a0aecd] dark:border-[#a0aecd]/50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#a0aecd] hover:bg-[#8a9ab9] text-[#000000] dark:bg-[#a0aecd]/80 dark:hover:bg-[#a0aecd] dark:text-[#000000]">
                  <Plus className="mr-2 h-4 w-4" /> Add Character
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-800 text-[#000000] dark:text-[#a0aecd]">
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
                    addCharacter(character)
                  }
                  e.currentTarget.reset()
                }}>
                  <div className="space-y-4">
                    <Input
                      name="name"
                      placeholder="Character Name"
                      defaultValue={editingCharacter?.name}
                      className="bg-white dark:bg-gray-700 text-[#000000] dark:text-[#a0aecd]"
                    />
                    <Textarea
                      name="description"
                      placeholder="Character Description"
                      defaultValue={editingCharacter?.description}
                      className="bg-white dark:bg-gray-700 text-[#000000] dark:text-[#a0aecd]"
                    />
                    <Textarea
                      name="personality"
                      placeholder="Character Personality"
                      defaultValue={editingCharacter?.personality}
                      className="bg-white dark:bg-gray-700 text-[#000000] dark:text-[#a0aecd]"
                    />
                    <Button type="submit" className="bg-[#a0aecd] hover:bg-[#8a9ab9] text-[#000000] dark:bg-[#a0aecd]/80 dark:hover:bg-[#a0aecd] dark:text-[#000000]">
                      {editingCharacter ? 'Update Character' : 'Add Character'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Button 
            onClick={generateStory}
            disabled={characters.length === 0}
            className="w-full bg-[#a0aecd] hover:bg-[#8a9ab9] text-[#000000] dark:bg-[#a0aecd]/80 dark:hover:bg-[#a0aecd] dark:text-[#000000] transition-colors duration-200"
          >
            Generate Story
          </Button>
          
          {story && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#000000] dark:text-[#a0aecd]">Generated Story</h3>
              <Textarea
                value={story}
                readOnly
                className="h-48 resize-none bg-[#a0aecd]/10 dark:bg-[#a0aecd]/5 text-[#000000] dark:text-[#a0aecd] border-[#a0aecd]/30 dark:border-[#a0aecd]/20 focus:ring-[#a0aecd] focus:border-[#a0aecd]"
              />
            </div>
          )}
          
          {Object.keys(characterSummaries).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#000000] dark:text-[#a0aecd]">Character Summaries</h3>
              {Object.entries(characterSummaries).map(([name, summary]) => (
                <div key={name} className="bg-[#a0aecd]/10 dark:bg-[#a0aecd]/5 p-4 rounded-md">
                  <h4 className="font-medium text-[#000000] dark:text-[#a0aecd]">{name}</h4>
                  <p className="text-sm text-[#000000]/80 dark:text-[#a0aecd]/80">{summary}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}