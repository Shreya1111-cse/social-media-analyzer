import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file found' }, { status: 400 });
    }

    // File ko buffer mein convert karein
    const buffer = Buffer.from(await file.arrayBuffer());

    // Tesseract worker
    const worker = await createWorker('eng'); // 'eng' = English
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();

    // Text ko JSON response mein wapas bhejein
    return NextResponse.json({ text });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}