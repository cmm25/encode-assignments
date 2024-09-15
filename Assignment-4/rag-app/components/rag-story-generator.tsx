'use client'
import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "next-themes"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
type Setting = 'country-side' | 'city' | 'forest' | 'beach' | 'mountains' | 'space' |'artic';
type Tone = 'dark' | 'fantasy' | 'witty' | 'romantic' | 'scary' | 'comic'| 'mystery'| 'sci-fi';


export function RagStoryGenerator() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedCharacters, setExtractedCharacters] = useState<string[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [characters, setCharacters] = useState<Character[]>([])
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [story, setStory] = useState('')
  const [characterSummaries, setCharacterSummaries] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tone, setTone] = useState<Tone>('witty');
  const [setting, setSetting] = useState<Setting>('country-side');
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
                {file ? file.name : 'No file chosen'}
              </span>
            </div>
          </div>
          
          <Button 
            onClick={extractCharacters} 
            disabled={!file || isExtracting}
            className="w-full bg-[#a0aecd] text-[#000000] transition-colors duration-200 hover:bg-[#8a9ab9] dark:bg-[#a0aecd]/80 dark:text-[#000000] dark:hover:bg-[#a0aecd]"
          >
            {isExtracting ? 'Extracting...' : 'Extract Characters'}
            <Wand2 className="ml-2 size-5" />
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
                    addCharacter(character)
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
          </div>
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
          <Button 
            onClick={generateStory}
            disabled={characters.length === 0}
            className="w-full bg-[#a0aecd] text-[#000000] transition-colors duration-200 hover:bg-[#8a9ab9] dark:bg-[#a0aecd]/80 dark:text-[#000000] dark:hover:bg-[#a0aecd]"
          >
            Generate Story
          </Button>
          
          {story && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#000000] dark:text-[#a0aecd]">Generated Story</h3>
              <Textarea
                value={story}
                readOnly
                className="h-48 resize-none border-[#a0aecd]/30 bg-[#a0aecd]/10 text-[#000000] focus:border-[#a0aecd] focus:ring-[#a0aecd] dark:border-[#a0aecd]/20 dark:bg-[#a0aecd]/5 dark:text-[#a0aecd]"
              />
            </div>
          )}
          
          {Object.keys(characterSummaries).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#000000] dark:text-[#a0aecd]">Character Summaries</h3>
              {Object.entries(characterSummaries).map(([name, summary]) => (
                <div key={name} className="rounded-md bg-[#a0aecd]/10 p-4 dark:bg-[#a0aecd]/5">
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