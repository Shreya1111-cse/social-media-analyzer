"use client"; // Client component rehna zaroori hai

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { parsePdf } from '../lib/pdfParser'; // <-- STEP 3 se import
import axios from 'axios'; // <-- Axios install kiya tha, ab use karenge

export default function Page() {
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setExtractedText('');

    try {
      if (file.type === 'application/pdf') {
        // --- PDF Logic (Step 3) ---
        const text = await parsePdf(file);
        setExtractedText(text);

      } else if (file.type.startsWith('image/')) {
        // --- Image OCR Logic (Step 4) ---
        const formData = new FormData();
        formData.append('file', file);

        // Naye API route ko call karein
        const response = await axios.post('/api/ocr', formData);
        
        setExtractedText(response.data.text);

      } else {
        throw new Error('Unsupported file type. Sirf PDF ya Image daalein.');
      }
    } catch (err: any) {
      setError(err.message || 'File process karne mein error hua');
    } finally {
      setIsLoading(false); // Loading hamesha false karein
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
  });

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Social Media Content Analyzer</h1>
      
      <div 
        {...getRootProps()} 
        style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', cursor: 'pointer' }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <p>Drag 'n' drop a PDF or image, or click to select</p>
        )}
      </div>

      {isLoading && <p style={{ textAlign: 'center' }}>Processing... Please wait.</p>}
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {extractedText && (
        <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '10px' }}>
          <h3>Extracted Text:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  );
}