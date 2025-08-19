import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";


export async function loadFile(filePath: string, mimeType: string): Promise<Document[]> {
  switch (mimeType) {
    case "application/pdf":
      return new PDFLoader(filePath).load();
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return new DocxLoader(filePath).load();
    case "text/plain":
      return new TextLoader(filePath).load();
    case "text/csv":
      return new CSVLoader(filePath).load();
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

export async function loadUrl(url: string, maxPages: number = 30): Promise<Document[]> {
    const visitedUrls = new Set<string>([url]);
    const queue: string[] = [url];
    const allDocuments: Document[] = [];
    
    while (queue.length > 0 && visitedUrls.size <= maxPages) {
        const currentUrl = queue.shift()!;
        
        try {
            // Load the current page
            const loader = new CheerioWebBaseLoader(currentUrl);
            const docs = await loader.load();
            allDocuments.push(...docs);
            
            // If we've reached the limit, stop adding more URLs
            if (visitedUrls.size >= maxPages) break;
            
            // Extract links from the loaded document
            // We're assuming the document content contains HTML
            const $ = await loader.scrape();
            // Define an interface for the element object
            interface CheerioElement {
                [key: string]: string | undefined;
            }

            $('a').each((_: number, element: CheerioElement) => {
                const href: string | undefined = $(element).attr('href');
                if (href && href.startsWith('http') && !visitedUrls.has(href)) {
                    visitedUrls.add(href);
                    if (visitedUrls.size <= maxPages) {
                        queue.push(href);
                    }
                }
            });
        } catch (error) {
            console.error(`Error loading ${currentUrl}:`, error);
        }
    }
    
    return allDocuments;
}