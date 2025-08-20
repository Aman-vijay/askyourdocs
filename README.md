# AskYourDocs 📚

A powerful AI-powered document chat application that allows you to upload various document types and have natural conversations with your content. Built with Next.js, OpenAI, and Qdrant vector database.

![AskYourDocs Demo](https://via.placeholder.com/800x400/2563eb/ffffff?text=AskYourDocs+Interface)

## ✨ Features

### 📄 Multi-Format Document Support
- **PDF Documents** - Extract text and chat with PDF content
- **Word Documents** (.docx) - Process Microsoft Word files
- **Text Files** (.txt) - Plain text document support  
- **CSV Files** - Structured data processing
- **Websites** - Crawl and index web pages (up to 100 pages)
- **Raw Text Input** - Direct text input for quick queries

### 🤖 Advanced AI Capabilities
- **RAG (Retrieval-Augmented Generation)** - Context-aware responses
- **Source Citations** - See exactly where answers come from
- **Vector Search** - Semantic similarity matching
- **Session Management** - Isolated conversations per user
- **Real-time Chat** - Instant responses with loading states

### 🎨 Modern UI/UX
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Drag & Drop Upload** - Intuitive file uploading
- **Clean Chat Interface** - Discord/ChatGPT-style messaging
- **Document Management** - View and manage uploaded content
- **Real-time Feedback** - Loading states and progress indicators

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- OpenAI API key
- Qdrant vector database (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/askyourdocs.git
   cd askyourdocs
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   QDRANT_URL=http://localhost:6333
   QDRANT_API_KEY=your_qdrant_api_key_here  # Optional for local instance
   NODE_ENV=development
   ```

4. **Start Qdrant (if running locally)**
   ```bash
   # Using Docker
   docker run -p 6333:6333 qdrant/qdrant
   
   # Or download from https://qdrant.tech/documentation/quick-start/
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)


## 🔧 API Endpoints

### Chat API (`/api/chat`)
- `POST` - Send messages and get AI responses
- `GET` - Retrieve chat history

### Documents API (`/api/documents`) 
- `POST` - Upload files, URLs, or text
- `GET` - List uploaded documents
- `DELETE` - Remove documents

### Index API (`/api/index`)
- `GET` - Get vector database status
- `POST` - Create/ensure collections
- `DELETE` - Remove collections/data
- `PUT` - Perform index operations

## 💡 Usage Examples

### Upload a PDF
1. Click "Upload Files" in the sidebar
2. Drag and drop your PDF or click to browse
3. Wait for processing completion
4. Start asking questions!

### Add a Website  
1. Click "Add Website"
2. Enter the URL (e.g., https://example.com)
3. Set max pages to crawl (1-100)
4. Click "Add Website"

### Direct Text Input
1. Use the text area at the bottom of the sidebar
2. Paste or type your content
3. Click "Add Text"

### Chat with Documents
1. Type your question in the chat input
2. Press Enter or click Send
3. View AI response with source citations
4. Continue the conversation naturally

## 🛠️ Configuration

### Vector Database Settings
```typescript
// lib/qdrant/collections.ts
const vectorConfig = {
  size: 1536,        // OpenAI text-embedding-3-small
  distance: "Cosine" // Similarity metric
}
```

### Text Chunking Options
```typescript
// lib/text/chunking.ts
const chunkingOptions = {
  chunkSize: 1000,      // Characters per chunk
  chunkOverlap: 200,    // Overlap between chunks
  separators: ['\n\n', '\n', ' ', '']
}
```

### RAG Configuration
```typescript
// lib/langchain/ragBuild.ts
const ragSettings = {
  model: "gpt-4",       // OpenAI model
  temperature: 0,       // Response randomness
  maxTokens: 2000      // Max response length
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!



### Environment Variables for Production
```env
OPENAI_API_KEY=sk-...
QDRANT_URL=https://your-qdrant-instance.com
QDRANT_API_KEY=your-production-key
NODE_ENV=production
```


## 🙏 Acknowledgments

- **OpenAI** - For powerful language models and embeddings
- **Qdrant** - For high-performance vector database
- **LangChain** - For document processing utilities
- **Next.js** - For the amazing React framework
- **Tailwind CSS** - For beautiful, responsive styling
- **chaiaurcode** -  For introduction to rag



## 📊 Roadmap

- [ ] **Multi-language Support** - Support for non-English documents
- [ ] **Advanced File Types** - PowerPoint, Excel, images with OCR
- [ ] **Collaborative Features** - Shared documents and conversations
- [ ] **Analytics Dashboard** - Usage statistics and insights
- [ ] **API Authentication** - JWT-based auth system


## 💬 Support


⭐ **Star us on GitHub if this project helped you!**