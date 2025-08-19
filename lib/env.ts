import {z} from "zod"

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(32).max(100),
  QDRANT_API_KEY: z.string().min(32).max(100),
  QDRANT_URL: z.string().url(),
  QDRANT_COLLECTION_NAME: z.string().min(2).max(100),
});

export const env = envSchema.parse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    QDRANT_API_KEY: process.env.QDRANT_API_KEY,
    QDRANT_URL: process.env.QDRANT_URL,
    QDRANT_COLLECTION_NAME: process.env.QDRANT_COLLECTION_NAME,
});