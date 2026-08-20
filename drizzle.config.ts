import { defineConfig } from "drizzle-kit";

// Uses Turso when TURSO_DATABASE_URL is set, otherwise the local eternity.db file.
// `npm run db:push` is how all 21 tables in src/db/schema.ts get created.
// Hand-written DDL is not maintained anywhere else, so the schema file stays the source of truth.
const tursoUrl = process.env.TURSO_DATABASE_URL;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  ...(tursoUrl
    ? {
        dialect: "turso" as const,
        dbCredentials: { url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN },
      }
    : {
        dialect: "sqlite" as const,
        dbCredentials: { url: "file:eternity.db" },
      }),
});
