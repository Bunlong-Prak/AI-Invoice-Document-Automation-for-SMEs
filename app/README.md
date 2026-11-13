# InvoiceAI — Full-Stack Application

This directory contains the Next.js 16 application for **InvoiceAI**.

For project overview, architecture, and complete documentation, refer to the [Root README](../README.md).

## Quick Start (Development)

### 1. Environment Setup
```bash
cp .env.example .env
```
Ensure you have configured:
- `DATABASE_URL` (PostgreSQL)
- `NEXTAUTH_SECRET` & `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- `GROQ_API_KEY` (or `OPENAI_API_KEY`)

### 2. Install Dependencies & Push Schema
```bash
npm install
npx drizzle-kit push
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Production Build & Docker

```bash
docker compose build
docker compose up -d
```
The Docker container automatically runs `npx drizzle-kit push` on startup before booting the server.
