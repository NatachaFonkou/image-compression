"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(80);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalSize(file.size);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setOriginalImage(event.target.result as string);
        setCompressedImage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const compressImage = () => {
    if (!originalImage) return;
  
    const img = new window.Image();
    img.src = originalImage;
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
      canvas.width = img.width;
      canvas.height = img.height;
  
      ctx.drawImage(img, 0, 0);
      
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality / 100);
      setCompressedImage(compressedDataUrl);
      
      // Conversion en Blob pour un calcul de taille plus précis
      fetch(compressedDataUrl)
        .then(res => res.blob())
        .then(blob => {
          setCompressedSize(blob.size);
        });
    };
  };

  return (
    <div className="bg-white flex flex-col items-center min-h-screen p-8 pb-20 gap-8 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl font-bold mt-8">Compression d'Image Simple</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-xl">
        <div className="flex flex-col gap-2">
          <label className="font-medium">Sélectionner une image</label>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="border rounded p-2"
          />
        </div>
        
        {originalImage && (
          <>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Qualité de compression ({quality}%)</label>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full" 
              />
            </div>
            
            <button 
              onClick={compressImage}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Compresser l&apos;image
            </button>
          </>
        )}
      </div>
      
      {originalImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-4">
          <div className="flex flex-col items-center">
            <h2 className="font-medium mb-2">Image Originale</h2>
            <div className="relative w-full aspect-video">
              <img 
                src={originalImage} 
                alt="Image originale" 
                className="object-contain w-full h-full"
              />
            </div>
            <p className="mt-2">Taille: {(originalSize / 1024).toFixed(2)} KB</p>
          </div>
          
          {compressedImage && (
            <div className="flex flex-col items-center">
              <h2 className="font-medium mb-2">Image Compressée</h2>
              <div className="relative w-full aspect-video">
                <img 
                  src={compressedImage} 
                  alt="Image compressée" 
                  className="object-contain w-full h-full"
                />
              </div>
              <p className="mt-2">Taille: {(compressedSize / 1024).toFixed(2)} KB</p>
              <p className="mt-1">Réduction: {((1 - compressedSize / originalSize) * 100).toFixed(1)}%</p>
              <a 
                href={compressedImage} 
                download="compressed_image.jpg"
                className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Télécharger
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}