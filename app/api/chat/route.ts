// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { embeddings } from "@/lib/langchain/embeddings";
import { retrieve } from "@/lib/langchain/retriever";
import { runRAG } from "@/lib/langchain/ragBuild";
import { env } from "@/lib/env";

interface QdrantPayloadMetadata {
  filename?: string;
  source?: string;
  loc?: { pageNumber?: number };
  snippet?: string;
  contentHash?: string;
  contentLength?: number;
  [key: string]: unknown;
}
interface QdrantPayload { content?: string; metadata?: QdrantPayloadMetadata }
interface QdrantSearchResult { id: string | number; score: number; payload?: QdrantPayload }

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }
    
    // 1. Generate query embedding using our embeddings service
    const queryVector = await embeddings.embedQuery(query);
    
    // 2. Retrieve relevant documents using our retriever
    const searchResults = await retrieve(
      queryVector,
      env.QDRANT_COLLECTION_NAME,
      5 // top K
    ) as QdrantSearchResult[];
    
    // 3. Extract document content from search results
    const relevantDocs = searchResults.map(result => {
      const metadata = result.payload?.metadata || {};
      const raw = result.payload?.content ?? metadata.snippet ?? '';
      const score = result.score ?? 0;
      if (!raw) return '';
      let docText = raw;
      if (metadata.filename) {
        docText += `\n[Source: ${metadata.filename}]`;
      } else if (metadata.source && metadata.source !== 'user_input') {
        docText += `\n[Source: ${metadata.source}]`;
      }
      if (metadata.loc?.pageNumber) {
        docText += `\n[Page: ${metadata.loc.pageNumber}]`;
      }
      docText += `\n[Relevance Score: ${score.toFixed(3)}]`;
      return docText;
    }).filter(Boolean);

    const embeddingsOnlyMode = searchResults.length > 0 && searchResults.every(r => !r.payload?.content) && searchResults.some(r => r.payload?.metadata?.contentHash);
    
    if (relevantDocs.length === 0) {
      return NextResponse.json({
        message: embeddingsOnlyMode
          ? "Embeddings found but raw document text is not stored (embeddings-only mode). Cannot generate grounded answer."
          : "No relevant documents found for your query. Please try rephrasing your question or upload more relevant content.",
        embeddingsOnlyMode,
      });
    }
    
    // 4. Use our RAG service to generate response
  const response = await runRAG(query, relevantDocs);
    
    // 5. Stream the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        try {
          // Convert the response to chunks for streaming
          const responseText = typeof response === 'string' ? response : response.toString();
          const chunks = responseText.match(/.{1,50}/g) || [responseText];
          
          let chunkIndex = 0;
          const sendChunk = () => {
            if (chunkIndex < chunks.length) {
              const chunk = chunks[chunkIndex];
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
              );
              chunkIndex++;
              // Add small delay for streaming effect
              setTimeout(sendChunk, 50);
            } else {
              // Send final message
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
              );
              controller.close();
            }
          };
          
          sendChunk();
        } catch (err) {
          console.error("Streaming error:", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              text: "Error generating response. Please try again." 
            })}\n\n`)
          );
          controller.close();
        }
      },
    });
    
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
    
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong during chat';
    console.error("❌ Chat error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Alternative non-streaming version for simpler use cases
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
  const query = url.searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }
    
    // Same logic as POST but return direct response
  const queryVector = await embeddings.embedQuery(query);
  const searchResults = await retrieve(queryVector, env.QDRANT_COLLECTION_NAME, 5) as QdrantSearchResult[];
  const relevantDocs = searchResults.map(r => r.payload?.content ?? r.payload?.metadata?.snippet ?? '').filter(Boolean);
  const embeddingsOnlyMode = searchResults.length > 0 && searchResults.every(r => !r.payload?.content) && searchResults.some(r => r.payload?.metadata?.contentHash);
    
    if (relevantDocs.length === 0) {
      return NextResponse.json({
        query,
        answer: embeddingsOnlyMode
          ? "Embeddings present but raw text not stored (embeddings-only mode). Cannot answer."
          : "No relevant documents found for your query.",
        sources: [],
        embeddingsOnlyMode,
      });
    }
    
    const response = await runRAG(query, relevantDocs);
    
    // Extract source information
    const sources = searchResults.map((result, index) => ({
      index: index + 1,
      score: result.score,
      filename: result.payload?.metadata?.filename || 'Unknown',
      page: result.payload?.metadata?.loc?.pageNumber || null,
      source: result.payload?.metadata?.source || 'Unknown'
    }));
    
    return NextResponse.json({
      query,
      answer: response,
      sources,
      documentsFound: relevantDocs.length
    });
    
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    console.error("❌ Chat GET error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}