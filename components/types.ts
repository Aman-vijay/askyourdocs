export type UploadType = 'file' | 'text' | 'website';

export interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
}
