"use client";
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Sun, Moon, Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

const processImage = async (image: File): Promise<{ name: string, description: string, isDangerous: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  const animals = [
    { name: "Lion", description: "The lion is a large cat of the genus Panthera native to Africa and India.", isDangerous: true },
    { name: "Rabbit", description: "Rabbits are small mammals in the family Leporidae of the order Lagomorpha.", isDangerous: false },
    { name: "Elephant", description: "Elephants are the largest existing land animals. Three living species are currently recognised.", isDangerous: true },
  ]
  return animals[Math.floor(Math.random() * animals.length)]
}

export default function AnimalAnalyzer() {
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<{ name: string, description: string, isDangerous: boolean } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!image) return
    setIsProcessing(true)
    try {
      const file = await fetch(image).then(r => r.blob()).then(blobFile => new File([blobFile], "image.jpg", { type: "image/jpeg" }))
      const result = await processImage(file)
      setResult(result)
    } catch (error) {
      console.error("Error processing image:", error)
    }
    setIsProcessing(false)
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <Card className={`w-full max-w-4xl ${isDarkMode ? 'bg-gray-800 shadow-xl text-gray-100' : 'bg-white shadow text-gray-900'}`}>
        <CardContent className="p-12">
          <div className="flex justify-between items-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight">Animal Analyzer</h1>
            <div className="flex items-center space-x-2">
              <Sun className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-yellow-500'}`} />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                id="dark-mode"
              />
              <Moon className={`h-5 w-5 ${isDarkMode ? 'text-blue-300' : 'text-gray-400'}`} />
            </div>
          </div>
          
          <div className="space-y-16">
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold">Upload an image of an animal</h2>
              <div className={`border-2 border-dashed rounded-lg p-12 text-center ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'} transition-colors duration-300`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Choose an image
                </label>
                {image && (
                  <p className="mt-4 text-sm">Image selected. Click &#39;Analyze&#39; to process.</p>
                )}
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleSubmit}
                  disabled={!image || isProcessing}
                  size="lg"
                  className={`px-8 py-3 text-lg ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} ${
                    isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-colors duration-300`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {image && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col space-y-4"
                >
                  <h2 className="text-2xl font-semibold">Uploaded Image</h2>
                  <img src={image} alt="Uploaded animal" className="w-full h-64 object-cover rounded-lg shadow-lg" />
                </motion.div>
              )}
              {result && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'}`}
                >
                  <div className={`p-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    <h2 className="text-2xl font-semibold">Analysis Result</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                        <Info className={`h-6 w-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium">Animal</h3>
                        <p className="text-lg font-semibold">{result.name}</p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                      <h3 className="text-xl font-medium mb-2">Description</h3>
                      <p>{result.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {result.isDangerous ? (
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                      ) : (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      )}
                      <div>
                        <h3 className="text-xl font-medium">Safety Assessment</h3>
                        <p className={`text-lg font-semibold ${result.isDangerous ? 'text-red-400' : 'text-green-400'}`}>
                          This animal is {result.isDangerous ? 'dangerous' : 'not dangerous'}.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}