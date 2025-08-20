import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import * as cheerio from "cheerio";

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

export async function loadUrl(startUrl: string, maxPages: number = 30): Promise<Document[]> {
  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const docs: Document[] = [];
  let baseHost: string | null = null;

  const normalize = (u: string): string | null => {
    try {
      const resolved = new URL(u, startUrl);
      if (!baseHost) baseHost = new URL(startUrl).host;
      // Stay within same host to avoid wandering the whole web
      if (resolved.host !== baseHost) return null;
      // Strip fragments
      resolved.hash = "";
      return resolved.toString();
    } catch {
      return null;
    }
  };

  while (queue.length && visited.size < maxPages) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    try {
      const loader = new CheerioWebBaseLoader(current);
      const pageDocs = await loader.load();
      // Attach source URL metadata
      pageDocs.forEach(d => {
        d.metadata = { ...d.metadata, source: current, type: "website" };
      });
      docs.push(...pageDocs);

      if (visited.size >= maxPages) break;

      // Fetch raw HTML for robust link extraction (loader.scrape not always stable across versions)
      const res = await fetch(current, { headers: { 'User-Agent': 'AskYourDocsCrawler/1.0' } });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);
      $('a[href]').each((_, el) => {
        const raw = $(el).attr('href');
        if (!raw) return;
        const normalized = normalize(raw);
        if (normalized && !visited.has(normalized) && !queue.includes(normalized) && docs.length < maxPages) {
          queue.push(normalized);
        }
      });
    } catch (err) {
      console.error(`Error crawling ${current}:`, err);
    }
  }

  return docs;
}