import { qdrant } from "../qdrant/client";

export async function retrieve(queryVector: number[], collection: string, topK = 5) {
  const results = await qdrant.search(collection, {
    vector: queryVector,
    limit: topK,
  });

  return results;
}
