"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { parsePdf } from '../lib/pdfParser';
import axios from 'axios';

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
        const text = await parsePdf(file);
        setExtractedText(text);

      } else if (file.type.startsWith('image/')) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post('/api/ocr', formData);
        setExtractedText(response.data.text);

      } else {
        throw new Error('Unsupported file type. Sirf PDF ya Image daalein.');
      }
    } catch (err) { // Fix 1: 'any' ko yahan se hataya
      // 'err' ko Error object maan kar uska message nikalein
      const error = err as Error;
      setError(error.message || 'File process karne mein error hua');
    } finally {
      setIsLoading(false);
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
          // Fix 2: Apostrophe ko &apos; se badla
          <p>Drag &apos;n&apos; drop a PDF or image, or click to select</p>
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