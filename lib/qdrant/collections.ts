import { qdrant } from "./client";

/**
 * Ensure a Qdrant collection exists with the expected vector size.
 * If it already exists with a different size, throw a descriptive error so caller can react.
 */
export async function ensureCollection(name: string, vectorSize: number) {
  const collections = await qdrant.getCollections();
  const existing = collections.collections.find((c) => c.name === name);

  if (!existing) {
    await qdrant.createCollection(name, {
      vectors: { size: vectorSize, distance: "Cosine" },
    });
    return { created: true, size: vectorSize };
  }

  // Fetch detailed config to verify dimensions
  const detail = await qdrant.getCollection(name);
  // Newer Qdrant returns either vectors config object or map
  type VectorsParam = { size?: number; default?: { size?: number } } | undefined;
  const vectorsParam: VectorsParam = (detail as unknown as { config?: { params?: { vectors?: VectorsParam }}}).config?.params?.vectors;
  const currentSize = vectorsParam?.size ?? vectorsParam?.default?.size;
  if (currentSize && currentSize !== vectorSize) {
    throw new Error(
      `Qdrant collection '${name}' exists with vector size ${currentSize}, expected ${vectorSize}. Delete or use a different collection name to proceed.`
    );
  }
  return { created: false, size: currentSize ?? vectorSize };
}
