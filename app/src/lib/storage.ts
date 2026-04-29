import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import os from "os";

// On Vercel, we MUST use /tmp for writing files.
// Locally, we can use the project's uploads folder.
const UPLOAD_DIR = process.env.VERCEL 
  ? "/tmp" 
  : path.join(process.cwd(), "uploads");

export async function ensureUploadDir(): Promise<void> {
  // /tmp always exists on Vercel/Linux, but we check/create for local dev
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ filename: string; filePath: string }> {
  await ensureUploadDir();

  const ext = path.extname(originalName);
  const filename = `${uuidv4()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(filePath, buffer);

  return { filename, filePath };
}

export async function getFilePath(filename: string): Promise<string> {
  return path.join(UPLOAD_DIR, filename);
}

export async function deleteFile(filename: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch {
    // File may not exist, ignore
  }
}
