import { qdrant } from "./client";

export async function ensureCollection(name: string, vectorSize: number) {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some((c) => c.name === name);

  if (!exists) {
    await qdrant.createCollection(name, {
      vectors: {
        size: vectorSize,
        distance: "Cosine",
      },
    });
  }
}
