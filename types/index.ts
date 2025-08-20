// types/index.ts
import type { ChatMessage as UIChatMessage } from './chat';

export interface DocumentSource {
  id: string | number;
  content: string;
  metadata: Record<string, unknown>;
  score?: number | null;
  snippet?: string;
}

export interface ChatMessage extends Omit<UIChatMessage, 'sources'> {
  sources?: DocumentSource[];
}

export interface DocumentUpload {
  file?: File;
  url?: string;
  text?: string;
  sessionId: string;
  collection?: string;
  maxPages?: number;
}

export interface ProcessedDocument {
  id: string | number;
  content: string;
  metadata: Record<string, unknown> & {
    source: string;
    type: string;
    sessionId: string;
    timestamp: string;
    chunkIndex?: number;
    totalChunks?: number;
  };
}

export interface ChatRequest {
  query: string;
  sessionId: string;
  collection?: string;
}

export interface ChatResponse {
  answer: string;
  response: string; // backward compatibility
  sources: DocumentSource[];
  sessionId: string;
  question?: string;
}

export interface IndexInfo {
  collection: string;
  exists: boolean;
  totalPoints: number;
  sessionPoints?: number | null;
  vectorConfig?: unknown;
  status?: string;
  sessionId?: string | null;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
}

export interface SessionData {
  id: string;
  documents: ProcessedDocument[];
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export type SupportedMimeTypes = 
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'text/plain'
  | 'text/csv';

export interface QdrantPoint {
  id: string | number;
  vector: number[];
  payload: {
    content: string;
    metadata: Record<string, unknown>;
  };
}