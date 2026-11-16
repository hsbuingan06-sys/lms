import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "\n[CANH BAO] Chua tim thay bien DATABASE_URL trong file .env!\n" +
    "He thong can ket noi toi PostgreSQL de luu tru khoa hoc va tien do hoc tap.\n" +
    "Vui long tao file server/.env voi noi dung:\n" +
    "DATABASE_URL=postgresql://postgres:password@localhost:5432/lms\n"
  );
}

export const pool = new Pool({
  connectionString: databaseUrl || "postgresql://postgres:postgres@localhost:5432/lms",
});

export const db = drizzle(pool, { schema });

export * from "./schema";
