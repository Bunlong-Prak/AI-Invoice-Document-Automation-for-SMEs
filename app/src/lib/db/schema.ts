import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  pgEnum,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const documentStatusEnum = pgEnum("document_status", [
  "uploaded",
  "processing",
  "processed",
  "error",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Documents table
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  status: documentStatusEnum("status").default("uploaded").notNull(),
  errorMessage: text("error_message"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Extracted invoices table
export const extractedInvoices = pgTable("extracted_invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .unique()
    .references(() => documents.id, { onDelete: "cascade" }),
  vendorName: varchar("vendor_name", { length: 255 }),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  date: varchar("date", { length: 50 }),
  currency: varchar("currency", { length: 10 }),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }),
  rawText: text("raw_text"),
  rawJson: text("raw_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Line items table
export const lineItems = pgTable("line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => extractedInvoices.id, { onDelete: "cascade" }),
  description: text("description"),
  quantity: varchar("quantity", { length: 50 }),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }),
  total: numeric("total", { precision: 12, scale: 2 }),
  sortOrder: integer("sort_order").default(0).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  invoice: one(extractedInvoices),
}));

export const extractedInvoicesRelations = relations(
  extractedInvoices,
  ({ one, many }) => ({
    document: one(documents, {
      fields: [extractedInvoices.documentId],
      references: [documents.id],
    }),
    lineItems: many(lineItems),
  })
);

export const lineItemsRelations = relations(lineItems, ({ one }) => ({
  invoice: one(extractedInvoices, {
    fields: [lineItems.invoiceId],
    references: [extractedInvoices.id],
  }),
}));
