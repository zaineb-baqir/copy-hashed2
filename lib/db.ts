import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";

// اتصال بقاعدة البيانات
const pool= mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root1",
  database: "mytest",
});

export const db = drizzle(pool, {
  schema,
  mode: "default",
});