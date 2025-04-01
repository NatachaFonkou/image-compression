"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(80);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalSize(file.size);
    setFileName(file.name);
    
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
    
    setIsCompressing(true);

    const img = new window.Image();
    img.src = originalImage;
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsCompressing(false);
        return;
      }

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
          setIsCompressing(false);
        });
    };
  };
  
  const resetCompression = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setOriginalImage(null);
    setCompressedImage(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setFileName("");
  };

  const getDownloadName = () => {
    if (!fileName) return "compressed_image.jpg";
    
    const nameParts = fileName.split(".");
    if (nameParts.length > 1) {
      nameParts.pop(); // Enlever l&apos;extension
      return `${nameParts.join(".")}_compressed.jpg`;
    }
    return `${fileName}_compressed.jpg`;
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-blue-600">ImageCompressor</h1>
        </div>
      </header>
      
      <main className="flex flex-col items-center w-full max-w-6xl mx-auto p-6 gap-8">
        {/* Introduction */}
        <div className="text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-3">Compressez vos images facilement</h2>
          <p className="text-gray-600">
            Réduisez la taille de vos images sans sacrifier la qualité visuelle.
            Parfait pour les sites web, les emails et le partage sur les réseaux sociaux.
          </p>
        </div>
        
        {/* Upload Area */}
        <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col gap-4">
            {!originalImage ? (
              <div 
                className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="text-blue-500 text-5xl">📁</div>
                  <p className="font-medium">Cliquez ou glissez-déposez une image ici</p>
                  <p className="text-sm text-gray-500">JPG, PNG ou WEBP (max 10MB)</p>
                </div>
                <input 

                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <label className="font-medium">Qualité de l&apos;image</label>
                    <span className="text-blue-600 font-medium">{quality}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-blue-600" 
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Compression maximale</span>
                    <span>Qualité maximale</span>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={compressImage}
                    disabled={isCompressing}
                    className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${isCompressing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isCompressing ? 'Compression en cours...' : 'Compresser l\'image'}
                  </button>
                  
                  <button 
                    onClick={resetCompression}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Results Section */}
        {originalImage && (
          <div className="w-full bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Résultat de la compression</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <div className="bg-gray-100 p-2 rounded-md mb-3">
                  <div className="aspect-video relative overflow-hidden rounded-md">
                    <img 
                      src={originalImage} 
                      alt="Image originale" 
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="font-medium text-lg">Image Originale</h4>
                  <div className="flex justify-between mt-1 text-gray-600">
                    <p>Fichier: {fileName}</p>
                    <p>Taille: {(originalSize / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              </div>
              
              {compressedImage ? (
                <div className="flex flex-col">
                  <div className="bg-gray-100 p-2 rounded-md mb-3">
                    <div className="aspect-video relative overflow-hidden rounded-md">
                      <img 
                        src={compressedImage} 
                        alt="Image compressée" 
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-medium text-lg">Image Compressée</h4>
                    <div className="flex justify-between mt-1 text-gray-600">
                      <p>Taille: {(compressedSize / 1024).toFixed(1)} KB</p>
                      <p>Réduction: <span className="text-green-600 font-medium">{originalSize > 0 ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : 0}%</span></p>
                    </div>
                    <a 
                      href={compressedImage} 
                      download={getDownloadName()}
                      className="block mt-4 text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Télécharger l&apos;image compressée
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 italic">Cliquez sur &quot;Compresser l&apos;image&quot; pour voir le résultat</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Features Section */}
        {!originalImage && !compressedImage && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="text-blue-500 text-3xl mb-3">🔒</div>
              <h3 className="font-bold text-lg mb-2">Sécurité Garantie</h3>
              <p className="text-gray-600">Traitement local - aucune image n&quot;est téléchargée sur un serveur externe.</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="text-blue-500 text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2">Compression Rapide</h3>
              <p className="text-gray-600">Réduisez la taille de vos images en quelques secondes sans perdre en qualité.</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="text-blue-500 text-3xl mb-3">📱</div>
              <h3 className="font-bold text-lg mb-2">Format Optimisé</h3>
              <p className="text-gray-600">Parfait pour les sites web, emails et le partage sur les réseaux sociaux.</p>
            </div>
          </div>
        )}
      </main>
      
      <footer className="w-full mt-auto py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ImageCompressor - Compressez vos images en ligne gratuitement</p>
      </footer>
    </div>
  );
}