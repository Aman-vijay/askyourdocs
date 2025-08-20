import { NextRequest, NextResponse } from 'next/server';
import { qdrant } from '@/lib/qdrant/client';
import { ensureCollection } from '@/lib/qdrant/collections';

interface QdrantCollectionsResponse { collections: { name: string }[] }
interface QdrantCollectionInfo { points_count?: number; status?: string; config?: { params?: { vectors?: unknown } } }
interface ScrollResultPoint { id: string | number }
interface ScrollResult { points: ScrollResultPoint[]; next_page_offset?: number }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection') || 'default';
    const sessionId = searchParams.get('sessionId');

    // Get collection info
  const collections = await qdrant.getCollections() as QdrantCollectionsResponse;
  const collectionExists = collections.collections.some(c => c.name === collection);

    if (!collectionExists) {
      return NextResponse.json({
        collection,
        exists: false,
        totalPoints: 0,
        message: 'Collection does not exist'
      });
    }

    // Get collection info
  const collectionInfo = await qdrant.getCollection(collection) as QdrantCollectionInfo;
    
    // Get points count for the collection
    const totalPoints = collectionInfo.points_count || 0;
    let sessionPoints: number | null = null;
    if (sessionId) {
      let offset: number | undefined = undefined;
      let count = 0;
      do {
        const params: Record<string, unknown> = {
          filter: {
            must: [
              { key: 'metadata.sessionId', match: { value: sessionId } }
            ]
          },
          limit: 100,
          with_payload: false
        };
        if (offset !== undefined) params.offset = offset;
        const result = await qdrant.scroll(collection, params) as ScrollResult;
        count += result.points.length;
        offset = result.next_page_offset;
      } while (offset !== undefined);
      sessionPoints = count;
    }

    return NextResponse.json({
      collection,
      exists: true,
      totalPoints,
  sessionPoints,
  vectorConfig: collectionInfo.config?.params?.vectors ?? null,
      status: collectionInfo.status,
      sessionId: sessionId || null
    });

  } catch (error) {
    console.error('Index GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve index information' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { collection = 'default', vectorSize = 1536, distance = 'Cosine' } = await request.json();

    // Create or ensure collection exists
    await ensureCollection(collection, vectorSize);

    // Get collection info to confirm creation
    const collectionInfo = await qdrant.getCollection(collection);

    return NextResponse.json({
      success: true,
      collection,
      vectorSize,
      distance,
      status: collectionInfo.status,
      message: `Collection '${collection}' created/ensured successfully`
    });

  } catch (error) {
    console.error('Index POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to create/ensure collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    const sessionId = searchParams.get('sessionId');

    if (!collection) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    if (sessionId) {
      // Delete only session-specific data
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
        message: `All data for session '${sessionId}' deleted from collection '${collection}'`
      });
    } else {
      // Delete entire collection
      await qdrant.deleteCollection(collection);

      return NextResponse.json({
        success: true,
        message: `Collection '${collection}' deleted successfully`
      });
    }

  } catch (error) {
    console.error('Index DELETE API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection/session data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { collection, sessionId, action } = await request.json();

    if (!collection || !sessionId || !action) {
      return NextResponse.json(
        { error: 'Collection, sessionId, and action are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'reindex':
        // Reindex session data (placeholder - implement based on your needs)
        return NextResponse.json({
          success: true,
          message: `Reindexing session '${sessionId}' in collection '${collection}' - implement based on requirements`
        });

      case 'optimize':
        // Optimize collection (Qdrant handles this automatically, but you can trigger it)
        return NextResponse.json({
          success: true,
          message: `Collection '${collection}' optimization requested`
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Index PUT API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform index operation' },
      { status: 500 }
    );
  }
}