# InvoiceAI — AI-Powered Invoice & Document Automation for SMEs

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.1-emerald)](https://orm.drizzle.team/)
[![Groq LPU](https://img.shields.io/badge/Groq-LPU_Inference-orange)](https://groq.com/)
[![Lemon Squeezy](https://img.shields.io/badge/Billing-Lemon_Squeezy-purple)](https://www.lemonsqueezy.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A production-grade SaaS platform built to automate document and invoice data entry for SMEs, accounting firms, and logistics operations. 

InvoiceAI ingests invoices, receipts, and financial documents (PDFs and high-resolution images), extracts structured financial data (vendor, invoice number, dates, totals, taxes, currencies, and itemized line items) in under 2 seconds using a hybrid OCR + Multimodal Vision AI pipeline, and exports cleanly to CSV or downstream accounting systems.

---

## 🌟 Key Features

### 1. Hybrid Multimodal AI Extraction Pipeline
- **Digital PDFs**: Server-side document layout parsing via `pdf-parse` combined with fast LLM structural inference using Groq Llama 3.3 (`llama-3.3-70b-versatile`) or OpenAI (`gpt-4o-mini`).
- **Scanned Documents & Images (JPG, PNG, TIFF, BMP)**: Direct visual understanding with zero-OCR degradation using Groq Llama 3.2 Vision (`llama-3.2-11b-vision-preview`) or OpenAI (`gpt-4o-mini`).
- **Strict Schema Enforcement**: Zod-validated JSON output parsing ensures clean and typed financial objects with currency and date normalization.

### 2. Interactive Invoice Review & Editing
- **Field-Level Validation**: Review vendor names, invoice identifiers, issue dates, currencies, and subtotal/tax amounts.
- **Dynamic Line Items**: Add, edit, reorder, or delete itemized lines with real-time numeric normalization (`parseNumeric`) preventing database crashes from symbols like `$` or `,`.
- **Safe Reprocessing**: Re-trigger AI extraction at any time with automatic collision cleanup.

### 3. Developer API & Public Playground
- **Public API (`POST /api/v1/extract`)**: Authenticate via bearer API tokens (`inv_...`) to automate uploads from external systems, scripts, or ERP workflows.
- **Usage Gating & Headers**: Rate limits and monthly document caps are tracked per plan and reflected directly in response headers.
- **Interactive Playground (`/playground`)**: Frictionless web sandbox with in-memory IP rate limiting to evaluate extractions with live cURL previews before signing up.
- **API Key Management (`/settings/keys`)**: Self-serve API key generation, activation/deactivation, and revocation.

### 4. Search, Filtering & CSV Export
- **Database-Level Search**: Multi-field search across vendor names, document filenames, and invoice numbers with server-side pagination.
- **Date & Status Filters**: Filter by document lifecycle stage (`uploaded`, `processing`, `processed`, `error`) and date ranges.
- **RFC-Compliant CSV Export**: Bulk or selective export of invoices and line items with proper escaping.

### 5. SaaS Billing & Subscriptions (Lemon Squeezy)
- **Merchant of Record (MoR)**: Lemon Squeezy handles global sales taxes (VAT, GST) and compliance out of the box.
- **Global Payouts**: Ideal for founders globally, with support for PayPal and international bank payouts.
- **Automated Webhooks**: HMAC SHA-256 signature verification for instant tier upgrades, cancellations, and usage renewals.
- **Self-Serve Customer Portal**: Direct redirect to manage payment methods and active subscriptions.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Radix/ShadCN UI | High-contrast dark-mode interface with Geist typography |
| **Backend** | Next.js Server Actions & Route Handlers | Edge and Node runtime APIs |
| **Database** | PostgreSQL 16 + Drizzle ORM | Type-safe migrations, relations, and connection pooling |
| **Authentication** | NextAuth v5 (Auth.js) | Google OAuth with session persistence and middleware protection |
| **AI Inference** | Groq LPU API / OpenAI API | Groq Llama 3.3 70B & Llama 3.2 Vision (configurable to OpenAI) |
| **Document Engine** | `pdf-parse` v2 (class-based engine) | High-speed server-side PDF stream extraction |
| **Billing & Payments**| Lemon Squeezy SDK (`@lemonsqueezy/lemonsqueezy.js`) | Subscriptions, hosted checkout, webhooks, customer portal |
| **Storage** | Local disk (`uploads/`) & `/tmp` on serverless | Clean file lifecycle with automatic disk cleanup on deletion |
| **Containerization**| Docker & Docker Compose | Multi-stage build with healthchecks and automatic migrations |

---

## 📁 Repository Structure

```
.
├── DESIGN.json                 # Design system specifications & design tokens
├── app/                        # Main Next.js full-stack application
│   ├── Dockerfile              # Multi-stage production & dev Docker container
│   ├── docker-compose.yml      # Orchestration for web app and PostgreSQL 16
│   ├── docker-entrypoint.sh    # Container startup script (schema push + dev server)
│   ├── drizzle.config.ts       # Drizzle ORM schema configuration
│   ├── middleware.ts           # NextAuth route protection middleware
│   ├── next.config.ts          # Turbopack & serverExternalPackages configuration
│   ├── package.json            # Dependencies and npm run scripts
│   ├── public/                 # Static brand assets and SVGs
│   ├── uploads/                # Local storage directory for uploaded files
│   └── src/
│       ├── app/
│       │   ├── (dashboard)/    # Authenticated dashboard layouts and pages
│       │   │   ├── dashboard/  # Document overview, analytics & export table
│       │   │   ├── invoices/   # Invoice detail view, field editor, line items
│       │   │   ├── settings/   # API key generator & quota usage tracking
│       │   │   └── upload/     # Drag-and-drop batch upload interface
│       │   ├── api/            # REST endpoints
│       │   │   ├── auth/       # NextAuth Google OAuth handler
│       │   │   ├── checkout/   # Lemon Squeezy checkout session creation
│       │   │   ├── demo/       # Unauthenticated rate-limited sandbox extraction
│       │   │   ├── documents/  # Query, paginate, search, and delete documents
│       │   │   ├── export/     # CSV exporter for invoices and itemized lines
│       │   │   ├── invoices/   # Fetch and update extracted invoice data
│       │   │   ├── keys/       # Create, list, revoke API keys
│       │   │   ├── portal/     # Customer billing portal session URL
│       │   │   ├── process/    # OCR + AI document extraction engine
│       │   │   ├── upload/     # Multi-part file upload handler
│       │   │   ├── usage/      # Monthly quota and tier limit checks
│       │   │   ├── v1/extract/ # Public programmatic developer extraction API
│       │   │   └── webhooks/   # Lemon Squeezy webhook listener
│       │   ├── login/          # Google OAuth sign-in page
│       │   ├── playground/     # Interactive public extraction lab
│       │   └── page.tsx        # High-converting marketing landing page
│       ├── components/         # Reusable UI primitives and layout components
│       ├── lib/
│       │   ├── ai-extract.ts   # Multimodal AI prompt engine (Groq & OpenAI)
│       │   ├── api-keys.ts     # Cryptographic API key generation and validation
│       │   ├── auth.ts         # NextAuth configuration and database adapter
│       │   ├── billing/        # Lemon Squeezy billing provider implementation
│       │   ├── db/             # Drizzle PostgreSQL client and table schemas
│       │   ├── ocr.ts          # Resilient PDF text extraction engine
│       │   ├── storage.ts      # Filesystem read/write/delete helpers
│       │   ├── usage.ts        # Quota enforcement and usage logging
│       │   └── utils.ts        # Formatting, currency, and numeric sanitization
│       └── types/              # TypeScript interfaces and NextAuth typings
└── README.md                   # Project documentation
```

---

## ⚡ Quick Start

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose (recommended), **OR** [Node.js 20+](https://nodejs.org/) and a local PostgreSQL instance.
- **Groq API Key** (Free at [console.groq.com](https://console.groq.com)) or an **OpenAI API Key**.
- **Google OAuth Credentials** (from Google Cloud Console).
- *(Optional)* **Lemon Squeezy Account** (for subscription billing).

---

### Method A: Run with Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/invoice-ai.git
   cd invoice-ai/app
   ```

2. **Configure your environment**:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your keys:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@db:5432/invoice_app
   POSTGRES_USER=user
   POSTGRES_PASSWORD=password
   POSTGRES_DB=invoice_app

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate-a-random-secret-key-here

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # AI Provider (Groq Llama 3)
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```

3. **Start the containers**:
   ```bash
   docker compose build
   docker compose up -d
   ```

4. **Access the application**:
   - Web App: [http://localhost:3000](http://localhost:3000)
   - Playground: [http://localhost:3000/playground](http://localhost:3000/playground)
   - PostgreSQL: `localhost:5432`

---

### Method B: Run Locally without Docker

1. **Install dependencies**:
   ```bash
   cd app
   npm install
   ```

2. **Set up local PostgreSQL**:
   Make sure PostgreSQL is running on port `5432`, create a database named `invoice_app`, and configure `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/invoice_app
   ```

3. **Push the database schema**:
   ```bash
   npx drizzle-kit push
   ```

4. **Start the Next.js development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables Reference

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@localhost:5432/invoice_app` | PostgreSQL connection string |
| `POSTGRES_USER` | Docker | `user` | Database user for Docker container |
| `POSTGRES_PASSWORD` | Docker | `password` | Database password for Docker container |
| `POSTGRES_DB` | Docker | `invoice_app` | Database name for Docker container |
| `NEXTAUTH_URL` | **Yes** | `http://localhost:3000` | Canonical app URL for OAuth callbacks |
| `NEXTAUTH_SECRET` | **Yes** | `openssl rand -base64 32` | Secret used to encrypt Auth.js session cookies |
| `GOOGLE_CLIENT_ID` | **Yes** | `*.apps.googleusercontent.com` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | **Yes** | `GOCSPX-...` | Google OAuth Client Secret |
| `GROQ_API_KEY` | Recommended | `gsk_...` | Groq API Key for fast Llama 3 inference |
| `GROQ_VISION_MODEL` | No | `llama-3.2-11b-vision-preview` | Override vision model on Groq |
| `GROQ_TEXT_MODEL` | No | `llama-3.3-70b-versatile` | Override text model on Groq |
| `OPENAI_API_KEY` | Alternative | `sk-...` | OpenAI API key (if using OpenAI instead of Groq) |
| `VISION_MODEL` | No | `gpt-4o-mini` | Override vision model when using OpenAI |
| `TEXT_MODEL` | No | `gpt-4o-mini` | Override text model when using OpenAI |
| `LEMONSQUEEZY_API_KEY` | Billing | `your_api_key` | Lemon Squeezy API token |
| `LEMONSQUEEZY_STORE_ID`| Billing | `12345` | Lemon Squeezy numeric store identifier |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Billing | `your_secret` | Webhook verification signing secret |
| `LEMONSQUEEZY_VARIANT_ID_STARTER` | Billing | `variant_starter_id` | Lemon Squeezy Variant ID for Starter plan |
| `LEMONSQUEEZY_VARIANT_ID_GROWTH` | Billing | `variant_growth_id` | Lemon Squeezy Variant ID for Growth plan |
| `LEMONSQUEEZY_VARIANT_ID_BUSINESS`| Billing | `variant_business_id` | Lemon Squeezy Variant ID for Business plan |

---

## 📡 API Documentation

### 1. Developer Extraction API (`POST /api/v1/extract`)
Extracts structured financial JSON directly from an invoice document. Requires an active API key.

- **URL**: `https://your-domain.com/api/v1/extract`
- **Headers**:
  - `Authorization: Bearer <API_KEY>`
  - `Content-Type: multipart/form-data`
- **Body**:
  - `file`: Binary document file (`application/pdf`, `image/jpeg`, `image/png`, `image/tiff`, `image/bmp`). Max 10MB.

#### Example cURL Request:
```bash
curl -X POST http://localhost:3000/api/v1/extract \
  -H "Authorization: Bearer inv_your_api_key_here" \
  -F "file=@/path/to/invoice_001.pdf"
```

#### Example Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "vendor_name": "Acme Industrial Supplies",
    "invoice_number": "INV-2026-9042",
    "date": "2026-04-15",
    "currency": "USD",
    "total_amount": "1425.50",
    "tax_amount": "129.59",
    "line_items": [
      {
        "description": "Standard Hydraulic Filter 24mm",
        "quantity": "5",
        "unit_price": "180.00",
        "total": "900.00"
      },
      {
        "description": "High-Pressure Seal Kit",
        "quantity": "2",
        "unit_price": "197.955",
        "total": "395.91"
      }
    ]
  },
  "usage": {
    "used": 14,
    "limit": 1000,
    "remaining": 986
  }
}
```

---

### 2. Public Demo Extraction (`POST /api/demo/extract`)
Unauthenticated sandbox endpoint powering the `/playground` page. Rate-limited to 5 requests per hour per IP.

```bash
curl -X POST http://localhost:3000/api/demo/extract \
  -F "file=@receipt.png"
```

---

### 3. Internal Application Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Uploads one or more documents to server storage |
| `POST` | `/api/process` | Runs OCR + Multimodal extraction on an uploaded document ID |
| `GET` | `/api/documents` | Lists user documents with search, date filter, and pagination |
| `GET` | `/api/documents/:id` | Fetches document details, extracted invoice, and line items |
| `DELETE` | `/api/documents/:id` | Deletes document record and deletes local file from disk |
| `GET` | `/api/invoices/:id` | Fetches an extracted invoice and its line items |
| `PUT` | `/api/invoices/:id` | Updates invoice header fields and line items with safe numeric parsing |
| `POST` | `/api/export` | Generates and streams an RFC-compliant CSV export |
| `GET` | `/api/keys` | Lists all generated API keys for the current user |
| `POST` | `/api/keys` | Creates a new secret API key |
| `DELETE` | `/api/keys/:id` | Revokes an API key |
| `GET` | `/api/usage` | Returns current month usage, tier, and remaining credits |
| `POST` | `/api/checkout` | Creates a Lemon Squeezy subscription checkout session |
| `GET` | `/api/portal` | Redirects the user to their Lemon Squeezy billing portal |
| `POST` | `/api/webhooks/lemonsqueezy` | Handles Lemon Squeezy subscription lifecycle events |

---

## 💳 Lemon Squeezy Billing Configuration

1. **Sign up at [Lemon Squeezy](https://app.lemonsqueezy.com/)** and create a Store.
2. **Create Subscription Products**:
   - **Starter**: `$29/month` (e.g. 1,000 documents)
   - **Growth**: `$99/month` (e.g. 10,000 documents)
   - **Business**: `$299/month` (e.g. 50,000 documents)
3. Copy the **Variant ID** of each product into:
   - `LEMONSQUEEZY_VARIANT_ID_STARTER`
   - `LEMONSQUEEZY_VARIANT_ID_GROWTH`
   - `LEMONSQUEEZY_VARIANT_ID_BUSINESS`
4. **Set up Webhook**:
   - In Lemon Squeezy Dashboard: **Settings > Webhooks**.
   - URL: `https://your-domain.com/api/webhooks/lemonsqueezy` (use `ngrok` for local testing).
   - Events:
     - `subscription_created`
     - `subscription_updated`
     - `subscription_cancelled`
     - `subscription_expired`
   - Set a **Signing Secret** and paste it into `LEMONSQUEEZY_WEBHOOK_SECRET`.
5. Generate an **API Key** under **Settings > API** and set `LEMONSQUEEZY_API_KEY`.

---

## 🛠️ Real-Life Bugs & Fixes Applied

During comprehensive auditing, several unrealistic behaviors, broken packages, and crashes were identified and redone:

1. **Fixed Production Build Crash (`ReferenceError: DOMMatrix is not defined`)**:
   - `pdf-parse` v2 bundles browser dependencies that crash Next.js Turbopack server builds. Added `serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"]` to `next.config.ts`.
2. **Fixed Broken PDF Parser (`TypeError: pdfParse is not a function`)**:
   - `pdf-parse` v2 changed its export structure from a default function to a class `{ PDFParse }`. Rewrote `ocr.ts` to instantiate `new PDFParse({ data: buffer })` with fallback compatibility for v1.
3. **Fixed Hallucinated & Decommissioned AI Models**:
   - The vision pipeline previously called `meta-llama/llama-4-scout-17b-16e-instruct` (a non-existent hallucinated model), causing all image extractions to silently fail. Updated to Groq's official vision model `llama-3.2-11b-vision-preview` (with OpenAI `gpt-4o-mini` support).
   - Text extraction previously targeted `llama3-70b-8192` (which Groq decommissioned). Updated to `llama-3.3-70b-versatile`.
   - Unified API key resolution to support both `GROQ_API_KEY` and `OPENAI_API_KEY`.
4. **Fixed Reprocessing Crash (`duplicate key value violates unique constraint`)**:
   - Reprocessing a document previously failed because `documentId` is unique in `extractedInvoices`. Added safe pre-deletion of previous extraction records before re-inserting.
5. **Fixed Postgres Numeric Syntax Crash (`invalid input syntax for type numeric: ""`)**:
   - Submitting an edited invoice with empty fields or currency symbols (`$`, `,`) crashed PostgreSQL. Implemented `parseNumeric()` to sanitize numbers or cast empty values to `null`.
6. **Fixed Disk Storage Leak on Document Deletion**:
   - Deleting a document previously only removed the database record while leaving physical files permanently orphaned on disk. Added `deleteFile(doc.filename)` on deletion.
7. **Fixed Search & Pagination In-Memory Filtering Bug**:
   - In-memory search filtering was applied after SQL pagination (`LIMIT/OFFSET`), causing search results on subsequent pages to disappear and returning inaccurate counts. Moved search and date filters directly into SQL `WHERE` conditions.
8. **Fixed Middleware Security Gap**:
   - Middleware matcher monitored `/settings/:path*`, but `protectedPaths` omitted `/settings`. Added full route protection and redirected authenticated users away from `/login`.
9. **Eliminated Ghost Microservice References & Misleading Claims**:
   - Removed obsolete references to a non-existent Python Docling microservice on port 8000 from `.env.example` and docs.
   - Removed hardcoded dev email bypass (`local@example.com`) on the landing page.
   - Corrected dashboard sidebar claims from "Bakong & KHR Native Bank Transfers" to realistic "Multi-Currency Extraction" (USD, EUR, KHR, GBP).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

