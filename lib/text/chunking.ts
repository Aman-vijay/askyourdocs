import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";

// Breaks docs into chunks for embeddings
export async function chunkDocuments(
  docs: Document[],
  chunkSize = 1000,
  chunkOverlap = 200
): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
  return splitter.splitDocuments(docs);
}
