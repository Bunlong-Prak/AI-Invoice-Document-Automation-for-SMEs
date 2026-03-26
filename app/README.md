# InvoiceAI — AI-Powered Invoice Automation for SMEs

A production-ready SaaS application for automated invoice processing using OCR + AI. Upload invoices, extract structured data instantly, manage and export — built for accounting firms, logistics companies, and SMEs.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: NextAuth v5 (Google OAuth)
- **OCR**: Tesseract.js
- **AI**: OpenAI GPT-4o-mini
- **Storage**: Local filesystem (`uploads/`)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials ([Console](https://console.cloud.google.com/apis/credentials))
- OpenAI API key ([Platform](https://platform.openai.com/api-keys))

### 1. Install Dependencies

```bash
cd app
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
DATABASE_URL=postgresql://user:password@localhost:5432/invoice_app
NEXTAUTH_SECRET=generate-a-random-secret-here
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
OPENAI_API_KEY=sk-your-openai-key
```

> **Generate a secret**: `openssl rand -base64 32`

### 3. Set Up Database

Create the database:

```bash
createdb invoice_app
```

Push the schema:

```bash
npx drizzle-kit push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Set **Authorized redirect URIs** to: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret into `.env`

## Features

### Upload
- Drag-and-drop or click to upload
- Multi-file support (PDF, JPG, PNG, TIFF, BMP)
- 10MB max file size
- Real-time upload progress

### AI Processing Pipeline
1. **OCR** — Tesseract.js extracts raw text from documents
2. **AI Extraction** — GPT-4o-mini parses structured invoice data
3. **Storage** — Results stored with vendor, amount, date, line items

### Dashboard
- Stats overview (total, processed, errors, total amount)
- Searchable, filterable invoice table
- Sort by date, vendor, amount, status
- Pagination

### Invoice Detail
- View all extracted fields
- Edit any field inline
- Add/edit/delete line items
- Reprocess failed documents
- View raw OCR text

### Export
- Export selected or all invoices to CSV
- Includes all fields and line items

## Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── (dashboard)/         # Protected pages
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── upload/          # Upload page
│   │   │   └── invoices/[id]/   # Invoice detail
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # NextAuth
│   │   │   ├── documents/       # CRUD documents
│   │   │   ├── invoices/[id]/   # Update invoice
│   │   │   ├── upload/          # File upload
│   │   │   ├── process/         # OCR + AI pipeline
│   │   │   └── export/          # CSV export
│   │   └── login/               # Login page
│   ├── components/
│   │   ├── ui/                  # ShadCN components
│   │   ├── layout/              # Sidebar
│   │   └── providers.tsx        # Auth + toast providers
│   ├── lib/
│   │   ├── db/                  # Drizzle schema + client
│   │   ├── auth.ts              # NextAuth config
│   │   ├── ocr.ts               # Tesseract wrapper
│   │   ├── ai-extract.ts        # OpenAI extraction
│   │   ├── storage.ts           # File storage
│   │   └── utils.ts             # Utilities
│   └── types/                   # TypeScript types
├── drizzle.config.ts
└── uploads/                     # Local file storage
```

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | User accounts (synced from Google OAuth) |
| `documents` | Uploaded files with status tracking |
| `extracted_invoices` | Parsed invoice data (1:1 with documents) |
| `line_items` | Invoice line items (many per invoice) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload files |
| POST | `/api/process` | Process document (OCR + AI) |
| GET | `/api/documents` | List documents with filters |
| GET | `/api/documents/:id` | Get document detail |
| DELETE | `/api/documents/:id` | Delete document |
| PUT | `/api/invoices/:id` | Update invoice data |
| POST | `/api/export` | Export to CSV |
