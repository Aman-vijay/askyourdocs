import {z} from "zod"

// Loosen max length to avoid failing on longer provider keys; keep minimums for sanity.
const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(32).max(256),
  QDRANT_API_KEY: z.string().min(16).max(256),
  QDRANT_URL: z.string().url(),
  QDRANT_COLLECTION_NAME: z.string().min(2).max(100),
});

const parsed = envSchema.safeParse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  QDRANT_API_KEY: process.env.QDRANT_API_KEY,
  QDRANT_URL: process.env.QDRANT_URL,
  QDRANT_COLLECTION_NAME: process.env.QDRANT_COLLECTION_NAME,
});

if (!parsed.success) {
  // Log redacted info to help debugging without exposing full secrets
  console.error('Environment validation failed:', parsed.error.issues.map(i => ({
    path: i.path.join('.'),
    message: i.message
  })));
  throw new Error('Invalid environment configuration. Check required keys in .env');
}

export const env = parsed.data;