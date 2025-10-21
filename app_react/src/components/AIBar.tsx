'use client';

import { useState, useRef, useContext } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/utils/firebase';

interface AIBarProps {
  onExtractComplete: (data: any) => void;
  isFormDirty: boolean;
}

const AIBar = ({ onExtractComplete, isFormDirty }: AIBarProps) => {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ data: any; meta: { model: string } } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [modelInfo, setModelInfo] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const validateUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleExtract = async () => {
    if (!validateUrl(url)) {
      setIsValidUrl(false);
      return;
    }

    setIsValidUrl(true);

    // Check if form is dirty and prompt user
    if (isFormDirty) {
      const shouldContinue = confirm('It seems there is already form data. This action will overwrite these fields. Do you want to continue?');
      if (!shouldContinue) {
        return;
      }
    }

    setIsLoading(true);
    setIsLocked(true);
    setError(null);
    setModelInfo(null); // Clear previous model info

    try {
      // Call the Firebase function
      const functions = getFunctions(app, process.env.NEXT_PUBLIC_USE_EMULATORS === 'true' ? 'http://localhost:5001' : undefined);
      const scrapeWebpage = httpsCallable(functions, 'scrapeWebpage');
      
      const result = await scrapeWebpage({
        url: url,
        scrapeType: 'events'
      });
      
      const response = result.data as { 
        data: { 
          title?: string; 
          startTime?: Date | string; 
          endTime?: Date | string; 
          description?: string; 
          bannerUri?: string 
        }; 
        meta: { model: string } 
      };
      
      // Update the form with the extracted data
      onExtractComplete({ ...response.data, url: url }); // Include the URL in the data
      
      // Set AI model info
      setModelInfo(response.meta.model);
      
      setAiResult(response);
    } catch (err) {
      setError(`Error: ${(err as Error).message || 'Failed to extract data from the URL. Please try again.'}`);
      console.error('Error extracting data:', err);
    } finally {
      setIsLoading(false);
      setIsLocked(false);
    }
  };

  return (
    <div className={`alert ${!error && isValidUrl ? 'alert-info' : error ? 'alert-error' : 'alert-info'} alert-soft mb-4 relative ${isLocked ? 'opacity-50' : ''}`}>
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100/80 z-10">
          <span className="loading loading-spinner loading-md mb-2"></span>
          <p>Extracting webpage data, please wait...</p>
        </div>
      )}
      
      <div className="join w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="Input URL to extract event data using Gemini!"
          className="join-item input input-bordered w-full"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setIsValidUrl(true); // Reset validation when user types
            setError(null); // Reset error when user types
          }}
          disabled={isLocked}
        />
        <button 
          className="join-item btn btn-primary"
          onClick={handleExtract}
          disabled={isLocked}
        >
          Extract
        </button>
      </div>
      
      {!isValidUrl && (
        <div className="mt-2 text-error">
          Please enter a valid URL
        </div>
      )}
      
      {error && (
        <div className="alert alert-error alert-outline mt-2">
          {error}
        </div>
      )}
      
      {modelInfo && (
        <div className="mt-2 text-sm">
          Model: {modelInfo}
        </div>
      )}
    </div>
  );
};

export default AIBar;