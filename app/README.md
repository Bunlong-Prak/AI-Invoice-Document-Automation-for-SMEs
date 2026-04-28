# InvoiceAI — AI-Powered Invoice Automation for SMEs

A production-ready SaaS application for automated invoice processing using OCR + AI. Upload invoices, extract structured data instantly, manage and export — built for accounting firms, logistics companies, and SMEs.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: NextAuth v5 (Google OAuth)
- **OCR**: Docling (ML-powered layout parsing)
- **AI**: Groq (Llama-3-70b-8192) for ultra-fast extraction
- **Payments**: Lemon Squeezy (Merchant of Record)
- **Storage**: Local filesystem (`uploads/`)

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Google OAuth credentials
- Groq API key (free at console.groq.com)
- Lemon Squeezy Store

### 1. Configure Environment

```bash
cd app
cp .env.example .env
```

Edit `.env` with your values.

### 2. Run with Docker

```bash
docker compose build
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000)

## Lemon Squeezy Setup

1. **Create a Store**: Sign up at [Lemon Squeezy](https://app.lemonsqueezy.com/) and create a store.
2. **Create Products**: Create three subscription products:
   - **Starter** ($29/mo)
   - **Growth** ($99/mo)
   - **Business** (Custom/Contact)
3. **Get Variant IDs**: In the Lemon Squeezy dashboard, find the **Variant ID** for each plan.
4. **Configure Webhook**:
   - Go to Settings > Webhooks.
   - Add a new webhook URL pointing to: `https://your-domain.com/api/webhooks/lemonsqueezy` (use **ngrok** for local testing).
   - Select events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`.
   - Set a **Webhook Secret** and copy it to your `.env`.
5. **API Key**: Generate an API Key in Settings > API and copy it to `LEMONSQUEEZY_API_KEY`.

## Features

### AI Processing Pipeline
1. **OCR** — **Docling** microservice uses ML models for accurate layout and table extraction.
2. **AI Extraction** — **Llama 3** (via Groq) parses the OCR markdown into structured JSON.
3. **Usage Gating** — Tiered monthly limits enforced at the API level.

### Subscriptions (Lemon Squeezy)
- **Merchant of Record**: Lemon Squeezy handles all global sales tax (VAT/GST) for you.
- **Cambodia Friendly**: Supports payouts via PayPal, ideal for founders in Cambodia.
- **Tiered Plans**:
  - **Free**: 100 docs/mo
  - **Starter**: 1,000 docs/mo
  - **Growth**: 10,000 docs/mo
  - **Business**: 50,000 docs/mo

## Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── checkout/        # Create LS checkout sessions
│   │   │   ├── portal/          # Customer portal redirect
│   │   │   └── webhooks/        # Billing webhooks
│   ├── lib/
│   │   ├── billing/             # Billing abstraction layer
│   │   │   ├── index.ts         # Generic billing interface
│   │   │   └── lemonsqueezy.ts  # LS provider implementation
│   │   ├── usage.ts             # Tier limits & tracking
│   │   └── ocr.ts               # Docling client
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/extract` | Public API for document extraction |
| POST | `/api/checkout` | Create billing checkout session |
| GET | `/api/portal` | Get customer billing portal |
| POST | `/api/process` | Process document (OCR + AI) |
