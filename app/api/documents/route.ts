// app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loadFile, loadUrl } from '@/lib/langchain/loaders';
import { embeddings } from '@/lib/langchain/embeddings';
import { ensureCollection } from '@/lib/qdrant/collections';
import { qdrant } from '@/lib/qdrant/client';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const url = formData.get('url') as string;
    const text = formData.get('text') as string;
    const sessionId = formData.get('sessionId') as string;
    const collection = (formData.get('collection') as string) || 'default';

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

  interface IngestedDoc { pageContent: string; metadata: Record<string, unknown>; }
  let documents: IngestedDoc[] = [];

    // Handle different input types
    if (file) {
      // Handle file upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create temporary file
      const tempPath = join('/tmp', `${uuidv4()}_${file.name}`);
      await writeFile(tempPath, buffer);

      try {
        documents = await loadFile(tempPath, file.type);
      } finally {
        // Clean up temporary file
        await unlink(tempPath).catch(() => {});
      }
    } else if (url) {
      // Handle URL
      const maxPages = parseInt(formData.get('maxPages') as string) || 10;
      documents = await loadUrl(url, maxPages);
    } else if (text) {
      // Handle raw text input
      documents = [{
        pageContent: text,
        metadata: {
          source: 'user_input',
          type: 'text',
          sessionId,
          timestamp: new Date().toISOString()
        }
      }];
    } else {
      return NextResponse.json({ error: 'No file, URL, or text provided' }, { status: 400 });
    }

    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(documents);

    // Ensure collection exists
    const vectorSize = 1536; // text-embedding-3-small dimension
    await ensureCollection(collection, vectorSize);

    // Generate embeddings and store in vector database
  interface Point { id: string; vector: number[]; payload: { content: string; metadata: Record<string, unknown> } & Record<string, unknown> }
  const points: Point[] = [];
    
    for (let i = 0; i < splitDocs.length; i++) {
      const doc = splitDocs[i];
      const embedding = await embeddings.embedQuery(doc.pageContent);
      
      points.push({
        id: uuidv4(),
        vector: embedding,
        payload: {
          content: doc.pageContent,
          metadata: {
            ...doc.metadata,
            sessionId,
            chunkIndex: i,
            totalChunks: splitDocs.length
          }
        }
      });
    }

    // Upsert points to Qdrant
    await qdrant.upsert(collection, {
      wait: true,
      points: points
    });

    return NextResponse.json({
      success: true,
      documentsProcessed: documents.length,
      chunksCreated: splitDocs.length,
      collection,
      sessionId,
      message: 'Documents successfully processed and indexed'
    });

  } catch (error) {
    console.error('Documents API error:', error);
    return NextResponse.json(
      { error: 'Failed to process documents' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const collection = searchParams.get('collection') || 'default';

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get documents for the session
    const scrollResult = await qdrant.scroll(collection, {
      filter: {
        must: [
          {
            key: 'metadata.sessionId',
            match: { value: sessionId }
          }
        ]
      },
      limit: 100,
      with_payload: true
    });

    interface ScrolledPoint { id: string | number; payload?: { content?: string; metadata?: Record<string, unknown> }; score?: number }
    const documents = (scrollResult.points as ScrolledPoint[]).map(point => ({
      id: point.id,
      content: (point.payload?.content || '').substring(0, 200) + (point.payload?.content ? '...' : ''),
      metadata: point.payload?.metadata || {},
      score: point.score ?? null
    }));

    return NextResponse.json({
      sessionId,
      collection,
      documents,
      total: documents.length
    });

  } catch (error) {
    console.error('Get documents API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const collection = searchParams.get('collection') || 'default';
    const documentId = searchParams.get('documentId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (documentId) {
      // Delete specific document
      await qdrant.delete(collection, {
        points: [documentId]
      });

      return NextResponse.json({
        success: true,
        message: `Document ${documentId} deleted`
      });
    } else {
      // Delete all documents for the session
      await qdrant.delete(collection, {
        filter: {
          must: [
            {
              key: 'metadata.sessionId',
              match: { value: sessionId }
            }
          ]
        }
      });

      return NextResponse.json({
        success: true,
        message: `All documents for session ${sessionId} deleted`
      });
    }

  } catch (error) {
    console.error('Delete documents API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete documents' },
      { status: 500 }
    );
  }
}