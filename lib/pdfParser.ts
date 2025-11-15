// Fix 1: Add a description for the @ts-expect-error
// @ts-expect-error: The 'pdfjs-dist/legacy/build/pdf' module lacks official type declarations.
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/legacy/build/pdf.worker.min.js`;

export async function parsePdf(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let allText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Fix 2: Use a specific type for 'item'
    allText += textContent.items.map((item: { str: string }) => item.str).join(' ') + '\n';
  }

  return allText;
}