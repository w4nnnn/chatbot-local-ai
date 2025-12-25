# 🤖 Local AI Chatbot

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-green)](https://ollama.ai/)

**A smart local AI chatbot with RAG (Retrieval Augmented Generation) capabilities**

[🇮🇩 Bahasa Indonesia](./README.id.md)

</div>

---

## ✨ Features

- 🧠 **RAG Chatbot** - Intelligent responses based on your uploaded data
- 🎯 **Intent Detection** - Smart query classification using LLM
- 🔍 **Hybrid Search** - Combination of vector search + fuzzy search for typo tolerance
- 📊 **Data Upload** - Support for CSV, XLSX, and XLS files
- 🎨 **Multi-theme** - 5 beautiful color themes (Violet, Blue, Emerald, Rose, Amber)
- ⚡ **Response Time** - Display response time for each message
- 🔒 **100% Local** - All data and AI processing stays on your machine

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.1.1 (App Router) |
| **Frontend** | React 19, Tailwind CSS 4, Radix UI |
| **Database** | SQLite (better-sqlite3) + Drizzle ORM |
| **Vector Store** | LanceDB |
| **LLM (Chat)** | Ollama (qwen3:1.7b) |
| **LLM (Intent)** | Ollama (qwen2.5:3b) |
| **Embeddings** | Ollama (nomic-embed-text) |
| **File Parser** | xlsx, papaparse |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   ```bash
   node --version
   ```

2. **Ollama** - Local AI runtime
   - Download from [ollama.com](https://ollama.com/)
   - Pull required models:
   ```bash
   ollama pull qwen3:1.7b        # For chat responses
   ollama pull qwen2.5:3b        # For intent detection
   ollama pull nomic-embed-text  # For embeddings
   ```

---

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/w4nnnn/chatbot-local-ai.git
   cd chatbot-local-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize database**
   ```bash
   npx drizzle-kit push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
chatbot-local-ai/
├── actions/              # Server Actions
│   ├── ollama.ts        # RAG Chat & LLM integration
│   ├── intent.ts        # Intent detection using LLM
│   ├── embed.ts         # Embedding & hybrid search
│   ├── upload.ts        # File upload & parsing
│   └── settings.ts      # App settings management
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout with theme provider
│   ├── page.tsx         # Main page component
│   └── globals.css      # Global styles & CSS variables
├── components/           # React Components
│   ├── chat/            # Chat interface components
│   ├── upload/          # File upload components
│   ├── layout/          # Layout components (sidebar)
│   └── ui/              # shadcn/ui components
├── lib/                  # Utility libraries
│   ├── db/              # Drizzle ORM setup & schema
│   └── lancedb/         # LanceDB vector store
└── data/                 # Database files (SQLite, LanceDB)
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│  ┌─────────────────────┐    ┌──────────────────────────┐    │
│  │   Chat Interface    │    │    Upload Interface      │    │
│  └─────────────────────┘    └──────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                     Server Actions                           │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │
│  │ ollama   │ │  intent  │ │ embed  │ │ upload │ │settings│ │
│  └──────────┘ └──────────┘ └────────┘ └────────┘ └───────┘ │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                              │
│  ┌────────────────────┐    ┌─────────────────────────────┐  │
│  │   SQLite (Drizzle) │    │    LanceDB (Vector Store)   │  │
│  └────────────────────┘    └─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Ollama (Local AI)                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ qwen3:1.7b (Chat) │ qwen2.5:3b (Intent) │ nomic (Emb)  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 Usage

### Upload Data
1. Click **"Upload"** in the sidebar
2. Drag & drop or select a file (CSV, XLSX, XLS)
3. For Excel files with multiple sheets, select which sheets to upload
4. Click **"Simpan"** to save and embed the data

### Chat with Your Data
1. Click **"Chat"** in the sidebar
2. Ask questions about your uploaded data
3. The chatbot will use RAG to find relevant information

### Query Types Supported
- **Simple Search**: "cari laptop gaming"
- **Superlative**: "produk termurah", "stok terbanyak"
- **Budget Query**: "laptop di bawah 7 juta"
- **Aggregation**: "total stok", "rata-rata harga"

---

## 🗄️ Database Schema

### `uploaded_files`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| filename | TEXT | Unique filename |
| originalName | TEXT | Original file name |
| fileType | TEXT | File type (csv, xlsx, xls) |
| sheetName | TEXT | Sheet name (for Excel) |
| headers | JSON | Column headers |
| data | JSON | Row data |
| rowCount | INTEGER | Number of rows |
| createdAt | TIMESTAMP | Created timestamp |

### `settings`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| key | TEXT | Setting key |
| value | TEXT | Setting value |

---

## 🧑‍💻 Development

```bash
# Start development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm run start

# Database studio (Drizzle)
npx drizzle-kit studio
```

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

<div align="center">
Made with ❤️ using Next.js and Ollama
</div>
