import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import path from "path";

const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/lms";

export default defineConfig({
  schema: path.join(__dirname, "./src/db/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
});
