
import { NextRequest, NextResponse } from "next/server";
import { loadFile, loadUrl } from "@/lib/langchain/loaders";
import { chunkDocuments } from "@/lib/text/chunking";
import { cleanText } from "@/lib/text/cleaning";
import { embeddings } from "@/lib/langchain/embeddings";
import { ensureCollection } from "@/lib/qdrant/collections";
import { qdrant } from "@/lib/qdrant/client";
import { env } from "@/lib/env";
import { Document } from "@langchain/core/documents";
import os from "os";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = 'nodejs';

interface QdrantPoint { id: string | number; vector: number[]; payload: { content: string; metadata: Record<string, unknown> } }

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const type = formData.get("type") as string;
    const file = formData.get("file") as File | null;
    
    let docs: Document[] = [];
    switch (type) {
      case "text": {
        const content = formData.get("content") as string;
        if (!content) return NextResponse.json({ error: "No text content provided" }, { status: 400 });
        const cleanedContent = cleanText(content);
        docs = [new Document({ pageContent: cleanedContent, metadata: { type: "text", source: "user_input" } })];
        break;
      }
      case "file": {
        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempDir = os.tmpdir();
        const filePath = path.join(tempDir, file.name);
        fs.writeFileSync(filePath, buffer);
        try {
          const mimeType = getMimeType(file.name);
            // NOTE: The original code for the loadFile function in loaders.ts likely had issues
          docs = await loadFile(filePath, mimeType);
          docs = docs.map(doc => ({ ...doc, metadata: { ...doc.metadata, filename: file.name, type: "file" }}));
        } finally {
          fs.unlinkSync(filePath);
        }
        break;
      }
      case "website": {
        const url = formData.get("url") as string;
        const maxPages = parseInt(formData.get("maxPages") as string) || 5;
        if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });
        try {
          docs = await loadUrl(url, maxPages);
        } catch (err) {
          console.error("❌ Website loading failed:", err);
          return NextResponse.json({ error: "Failed to load website. Please check the URL and try again." }, { status: 500 });
        }
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid type specified" }, { status: 400 });
    }

    if (docs.length === 0) return NextResponse.json({ error: "No content found to index" }, { status: 400 });

    docs = docs.map(doc => ({ ...doc, pageContent: cleanText(doc.pageContent) }));
    let chunkedDocs = await chunkDocuments(docs, 1000, 200);
    // Drop empty / whitespace-only chunks
    chunkedDocs = chunkedDocs.filter(d => d.pageContent.trim().length > 0);
    if (chunkedDocs.length === 0) {
      return NextResponse.json({ error: "All chunks empty after cleaning" }, { status: 400 });
    }
  // Validate collection (dimension mismatch will throw with guidance)
  await ensureCollection(env.QDRANT_COLLECTION_NAME, 1536);

    const points: QdrantPoint[] = [];
    let firstVectorLength: number | undefined;
    for (let i = 0; i < chunkedDocs.length; i++) {
      const doc = chunkedDocs[i];
      // Safety: guard against extremely long content (shouldn't happen with chunking but just in case)
      if (doc.pageContent.length > 20_000) {
        doc.pageContent = doc.pageContent.slice(0, 20_000);
      }
      const embedding = await embeddings.embedQuery(doc.pageContent);
      if (firstVectorLength === undefined) firstVectorLength = embedding.length;
      points.push({
        id: randomUUID(),
        vector: embedding,
        payload: {
          content: doc.pageContent,
          metadata: { ...doc.metadata, chunkIndex: i, totalChunks: chunkedDocs.length }
        }
      });
    }
    if (firstVectorLength !== 1536) {
      return NextResponse.json({
        error: "Embedding dimension mismatch before upsert",
        got: firstVectorLength,
        expected: 1536,
        hint: "Ensure the OpenAI embedding model is text-embedding-3-small or recreate the collection with the correct dimension"
      }, { status: 400 });
    }

    try {
      // Quick sanity log for first vector length
      if (points.length > 0) {
        console.log(`Indexing ${points.length} points. Vector length: ${points[0].vector.length}`);
      }
      await qdrant.upsert(env.QDRANT_COLLECTION_NAME, { wait: true, points });
    } catch (e: unknown) {
      const errObj = e as { response?: { status?: number; data?: unknown }; data?: unknown; status?: number };
      const qErr = errObj.response?.data || errObj.data || errObj;
      console.error("Qdrant upsert error detail:", JSON.stringify(qErr, null, 2));
      const qErrStatus = (typeof qErr === 'object' && qErr !== null && 'status' in qErr) ? (qErr as { status?: number }).status : undefined;
      if (qErrStatus === 400 || errObj.response?.status === 400) {
        // Provide extra diagnostics
        return NextResponse.json({
          error: "Qdrant upsert failed (400)",
          detail: qErr,
          diagnostics: {
            firstVectorLength: points[0]?.vector?.length,
            totalPoints: points.length,
            collection: env.QDRANT_COLLECTION_NAME
          },
          hint: "Likely vector dimension mismatch or invalid payload. Delete/recreate the collection if dimensions differ: expected 1536."
        }, { status: 400 });
      }
      throw errObj;
    }

    return NextResponse.json({
      message: "Content indexed successfully",
      documentsProcessed: docs.length,
      chunksCreated: chunkedDocs.length,
      pointsIndexed: points.length
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong during indexing';
    console.error("❌ Indexing failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf': return 'application/pdf';
    case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.txt': return 'text/plain';
    case '.csv': return 'text/csv';
    default: return 'text/plain';
  }
}

export const config = { api: { bodyParser: false, sizeLimit: '20mb' } };
