import type { Config } from "drizzle-kit";
export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",    // مكان حفظ ملفات المهاجرات
  dialect: "mysql",
  dbCredentials: {
    host: "localhost",
    user: "root",
    password: "root1",
    database: "mytest",
  },
} satisfies Config;
