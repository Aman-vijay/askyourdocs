export interface SourceSnippet {
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: SourceSnippet[];
}

export interface IngestedDocument {
  id: string;
  name: string;
  type: 'file' | 'url' | 'text';
  size?: number;
  status: 'processed' | 'error' | 'loading';
}
