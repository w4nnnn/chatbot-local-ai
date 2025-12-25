# 🤖 Local AI Chatbot

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-green)](https://ollama.ai/)

**Chatbot AI lokal yang cerdas dengan kemampuan RAG (Retrieval Augmented Generation)**

[🇺🇸 English](./README.md)

</div>

---

## ✨ Fitur

- 🧠 **RAG Chatbot** - Jawaban cerdas berdasarkan data yang diupload
- 🎯 **Deteksi Intent** - Klasifikasi query menggunakan LLM
- 🔍 **Hybrid Search** - Kombinasi vector search + fuzzy search untuk toleransi typo
- 📊 **Upload Data** - Mendukung file CSV, XLSX, dan XLS
- 🎨 **Multi-tema** - 5 tema warna cantik (Violet, Blue, Emerald, Rose, Amber)
- ⚡ **Waktu Respons** - Menampilkan waktu respons untuk setiap pesan
- 🔒 **100% Lokal** - Semua data dan pemrosesan AI tetap di komputer Anda

---

## 🛠️ Teknologi

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | Next.js 16.1.1 (App Router) |
| **Frontend** | React 19, Tailwind CSS 4, Radix UI |
| **Database** | SQLite (better-sqlite3) + Drizzle ORM |
| **Vector Store** | LanceDB |
| **LLM** | Ollama (qwen2.5:3b) |
| **Embeddings** | Ollama (nomic-embed-text) |
| **Parser File** | xlsx, papaparse |

---

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

1. **Node.js** (v18 atau lebih tinggi)
   ```bash
   node --version
   ```

2. **Ollama** - Runtime AI lokal
   - Download dari [ollama.com](https://ollama.com/)
   - Pull model yang diperlukan:
   ```bash
   ollama pull qwen2.5:3b
   ollama pull nomic-embed-text
   ```

---

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/chatbot-local-ai.git
   cd chatbot-local-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Inisialisasi database**
   ```bash
   npx drizzle-kit push
   ```

4. **Jalankan development server**
   ```bash
   npm run dev
   ```

5. **Buka di browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Struktur Project

```
chatbot-local-ai/
├── actions/              # Server Actions
│   ├── ollama.ts        # RAG Chat & integrasi LLM
│   ├── intent.ts        # Deteksi intent menggunakan LLM
│   ├── embed.ts         # Embedding & hybrid search
│   ├── upload.ts        # Upload & parsing file
│   └── settings.ts      # Manajemen pengaturan
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Layout root dengan theme provider
│   ├── page.tsx         # Komponen halaman utama
│   └── globals.css      # Style global & CSS variables
├── components/           # Komponen React
│   ├── chat/            # Komponen antarmuka chat
│   ├── upload/          # Komponen upload file
│   ├── layout/          # Komponen layout (sidebar)
│   └── ui/              # Komponen shadcn/ui
├── lib/                  # Library utilitas
│   ├── db/              # Setup & schema Drizzle ORM
│   └── lancedb/         # Vector store LanceDB
└── data/                 # File database (SQLite, LanceDB)
```

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Antarmuka Pengguna                        │
│  ┌─────────────────────┐    ┌──────────────────────────┐    │
│  │   Antarmuka Chat    │    │   Antarmuka Upload       │    │
│  └─────────────────────┘    └──────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                     Server Actions                           │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │
│  │ ollama   │ │  intent  │ │ embed  │ │ upload │ │settings│ │
│  └──────────┘ └──────────┘ └────────┘ └────────┘ └───────┘ │
├─────────────────────────────────────────────────────────────┤
│                      Lapisan Data                            │
│  ┌────────────────────┐    ┌─────────────────────────────┐  │
│  │   SQLite (Drizzle) │    │    LanceDB (Vector Store)   │  │
│  └────────────────────┘    └─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Ollama (AI Lokal)                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  qwen2.5:3b (Chat & Intent)  │  nomic-embed-text (Emb) ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 Penggunaan

### Upload Data
1. Klik **"Upload"** di sidebar
2. Drag & drop atau pilih file (CSV, XLSX, XLS)
3. Untuk file Excel dengan banyak sheet, pilih sheet yang ingin diupload
4. Klik **"Simpan"** untuk menyimpan dan embed data

### Chat dengan Data Anda
1. Klik **"Chat"** di sidebar
2. Ajukan pertanyaan tentang data yang diupload
3. Chatbot akan menggunakan RAG untuk mencari informasi yang relevan

### Jenis Query yang Didukung
- **Pencarian Sederhana**: "cari laptop gaming"
- **Superlatif**: "produk termurah", "stok terbanyak"
- **Query Budget**: "laptop di bawah 7 juta"
- **Agregasi**: "total stok", "rata-rata harga"

---

## 🗄️ Schema Database

### `uploaded_files`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | INTEGER | Primary key |
| filename | TEXT | Nama file unik |
| originalName | TEXT | Nama file asli |
| fileType | TEXT | Tipe file (csv, xlsx, xls) |
| sheetName | TEXT | Nama sheet (untuk Excel) |
| headers | JSON | Header kolom |
| data | JSON | Data baris |
| rowCount | INTEGER | Jumlah baris |
| createdAt | TIMESTAMP | Waktu dibuat |

### `settings`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | INTEGER | Primary key |
| key | TEXT | Kunci pengaturan |
| value | TEXT | Nilai pengaturan |

---

## 🧑‍💻 Development

```bash
# Jalankan development server
npm run dev

# Jalankan linter
npm run lint

# Build untuk production
npm run build

# Jalankan production server
npm run start

# Database studio (Drizzle)
npx drizzle-kit studio
```

---

## 📄 Lisensi

MIT License - bebas digunakan untuk keperluan pribadi maupun komersial.

---

<div align="center">
Dibuat dengan ❤️ menggunakan Next.js dan Ollama
</div>
