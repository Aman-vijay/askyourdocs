import { Document } from "@langchain/core/documents";
import { embeddings } from "@/lib/langchain/embeddings";
import { ensureCollection } from "@/lib/qdrant/collections";
import { qdrant } from "@/lib/qdrant/client";
import { randomUUID } from "crypto";
import { env } from "@/lib/env";

export interface IngestionResult {
  pointsIndexed: number;
  chunksCreated: number;
  collection: string;
  mode: 'embeddings-only' | 'full';
}

export interface IngestOptions {
  docs: Document[];
  collection?: string;
  embeddingsOnly?: boolean;
  vectorSize?: number;
  extraMetadata?: Record<string, unknown>;
}

interface QdrantPoint { id: string | number; vector: number[]; payload: { content: string | null; metadata: Record<string, unknown> } }

/**
 * Ingest documents: batch embed, build consistent payload schema, and upsert.
 * Schema contract:
 * payload.content: string | null (null when embeddingsOnly)
 * payload.metadata: { snippet: string; hasContent: boolean; ...userMetadata }
 */
export async function ingestDocuments({
  docs,
  collection = env.QDRANT_COLLECTION_NAME,
  embeddingsOnly = process.env.EMBEDDINGS_ONLY === 'true',
  vectorSize = 1536,
  extraMetadata = {}
}: IngestOptions): Promise<IngestionResult> {
  if (!docs.length) throw new Error('No documents to ingest');
  await ensureCollection(collection, vectorSize);

  // Batch embed
  const contents = docs.map(d => d.pageContent);
  const vectors = await embeddings.embedDocuments(contents);
  if (vectors.length !== docs.length) {
    throw new Error(`Embedding count mismatch: expected ${docs.length} got ${vectors.length}`);
  }

  const points: QdrantPoint[] = docs.map((doc, i) => {
    const fullText = doc.pageContent;
    const snippet = fullText.slice(0, 500); // longer snippet for context
    const existingChunkIndex = typeof (doc.metadata as Record<string, unknown>)?.['chunkIndex'] === 'number'
      ? (doc.metadata as Record<string, unknown>)['chunkIndex'] as number
      : i;
    const metadata: Record<string, unknown> = {
      ...doc.metadata,
      ...extraMetadata,
      snippet,
      hasContent: !embeddingsOnly,
      chunkIndex: existingChunkIndex,
      totalChunks: docs.length
    };
    return {
      id: randomUUID(),
      vector: vectors[i],
      payload: {
        content: embeddingsOnly ? null : fullText,
        metadata
      }
    };
  });

  await qdrant.upsert(collection, { wait: true, points });

  return {
    pointsIndexed: points.length,
    chunksCreated: docs.length,
    collection,
    mode: embeddingsOnly ? 'embeddings-only' : 'full'
  };
}
