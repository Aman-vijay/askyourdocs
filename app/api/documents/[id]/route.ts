import { NextRequest, NextResponse } from 'next/server';
import { qdrant } from '@/lib/qdrant/client';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

// DELETE /api/documents/:id?collection=yourCollection
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  // Support both synchronous and asynchronous params per Next.js guidance
  const resolvedParams = await context.params;
  const id = resolvedParams?.id;
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return NextResponse.json({ error: 'Document id required in path' }, { status: 400 });
  }
  try {
    const url = new URL(_req.url);
    const collection = url.searchParams.get('collection') || env.QDRANT_COLLECTION_NAME;
    const result = await qdrant.delete(collection, { points: [id], wait: true });
    return NextResponse.json({ success: true, message: `Deleted document ${id}`, id, collection, result });
  } catch (err: unknown) {
    const qErr = err as { response?: { status?: number; data?: unknown } };
    console.error('❌ Path delete failed:', JSON.stringify(qErr?.response?.data || err, null, 2));
    const message = err instanceof Error ? err.message : 'Failed to delete document';
    return NextResponse.json({ error: message, detail: qErr?.response?.data }, { status: qErr?.response?.status || 500 });
  }
}
