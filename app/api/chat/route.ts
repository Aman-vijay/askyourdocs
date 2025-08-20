// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { embeddings } from '@/lib/langchain/embeddings';
import { retrieve } from '@/lib/langchain/retriever';
import { runRAG } from '@/lib/langchain/ragBuild';

interface ChatRequestBody {
  query: string;
  sessionId: string;
  collection?: string;
}

interface QdrantSearchResultPayload {
  content?: string;
  text?: string;
  metadata?: Record<string, unknown>; // metadata structure can vary
}

interface QdrantSearchResult {
  id: string | number;
  score: number;
  payload?: QdrantSearchResultPayload;
}

export async function POST(request: NextRequest) {
  try {
  const body: ChatRequestBody = await request.json();
  const { query, sessionId, collection = 'default' } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Generate embeddings for the query
    const queryEmbedding = await embeddings.embedQuery(query);

    // Retrieve relevant documents from vector store
    const searchResults = await retrieve(queryEmbedding, collection, 5);

    // Extract document content from search results
    const typedResults: QdrantSearchResult[] = searchResults as QdrantSearchResult[];
    const relevantDocs = typedResults
      .map(r => r.payload?.content || r.payload?.text || '')
      .filter(t => t && t.trim().length > 0);

    // Generate response using RAG
    const answer = await runRAG(query, relevantDocs);

    return NextResponse.json({
      answer,
      response: answer, // backward compatibility for existing frontend expecting `response`
      question: query,
      sources: typedResults.map(r => ({
        id: r.id,
        score: r.score,
        metadata: r.payload?.metadata || {},
        snippet: (r.payload?.content || r.payload?.text || '').substring(0, 200) + '...'
      })),
      sessionId,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat query' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Return chat history for the session (placeholder implementation)
    // In a real app, you'd store chat history in a database
    return NextResponse.json({
      sessionId,
      messages: [],
      message: 'Chat history endpoint - implement with your preferred storage solution'
    });

  } catch (error) {
    console.error('Chat history API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve chat history' },
      { status: 500 }
    );
  }
}