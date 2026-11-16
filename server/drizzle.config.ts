import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_PATH || "lms.db";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url,
  },
});
