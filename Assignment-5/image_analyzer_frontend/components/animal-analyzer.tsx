"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Upload, Sun, Moon, Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface Result {
  animal: string;
  confidence: number;
  description: string;
  isDangerous: boolean;
}

export default function AnimalAnalyzer() {
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const imageUrl = URL.createObjectURL(file);
      setInputImage(imageUrl);
    } else {
      alert("Please select a valid image file (jpg, jpeg, or png)");
    }
  };

  const handleRecognize = async () => {
    if (!inputImage) {
      console.error('No image selected');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      const response = await fetch(inputImage);
      const blob = await response.blob();
      formData.append('image', blob, 'image.jpg');

      const recognitionResponse = await fetch('https://fast-image-xv2j.onrender.com/classify', {
        method: 'POST',
        body: formData,
      });

      if (!recognitionResponse.ok) {
        throw new Error('Recognition request failed');
      }

      const result = await recognitionResponse.json();
      setResult(result);
      console.log("Recognition result:", result);
    } catch (error) {
      console.error("Error during recognition:", error);
      // Handle error, e.g., display error message to user
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <Card className={`w-full max-w-4xl ${isDarkMode ? 'bg-gray-800 shadow-xl text-gray-100' : 'bg-white shadow text-gray-900'}`}>
        <CardContent className="p-6 sm:p-12">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 sm:mb-0">Animal Analyzer</h1>
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
          
          <div className="space-y-8 sm:space-y-16">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-xl sm:text-2xl font-semibold">Upload an image of an animal</h2>
              <div className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'} transition-colors duration-300`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  <Upload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Choose an image
                </label>
                {inputImage && (
                  <p className="mt-4 text-sm">Image selected. Click &#39;Analyze&#39; to process.</p>
                )}
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleRecognize}
                  disabled={!inputImage || isProcessing}
                  size="lg"
                  className={`px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} ${
                    isDarkMode ? 'bg-[#c19c70] hover:bg-[rgb(200,114,13)]' : 'bg-[#c19c70] hover:bg-[rgb(200,114,13)]'
                  } text-white transition-colors duration-300`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16">
              {inputImage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col space-y-4"
                >
                  <h2 className="text-xl sm:text-2xl font-semibold">Uploaded Image</h2>
                  <div className="relative w-full h-48 sm:h-64">
                    <Image 
                      src={inputImage} 
                      alt="Uploaded animal" 
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </motion.div>
              )}
              {result && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'}`}
                >
                  <div className={`p-4 sm:p-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    <h2 className="text-xl sm:text-2xl font-semibold">Analysis Result</h2>
                  </div>
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 sm:p-3 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                        <Info className={`h-5 w-5 sm:h-6 sm:w-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-medium">Animal</h3>
                        <p className="text-base sm:text-lg font-semibold">{result.animal}</p>
                      </div>
                    </div>
                    <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                      <h3 className="text-lg sm:text-xl font-medium mb-2">Description</h3>
                      <p className="text-sm sm:text-base">{result.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {result.isDangerous ? (
                        <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                      ) : (
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                      )}
                      <div>
                        <h3 className="text-lg sm:text-xl font-medium">Safety Assessment</h3>
                        <p className={`text-base sm:text-lg font-semibold ${result.isDangerous ? 'text-red-400' : 'text-green-400'}`}>
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
  );
}