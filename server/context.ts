import { inferAsyncReturnType } from "@trpc/server";
import jwt from "jsonwebtoken";

export async function createTRPCContext(opts: { req: Request }) {
  const cookieHeader = opts.req.headers.get("cookie") || "";
  const match = cookieHeader.match(/token=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    return { user: null }; // بدل رمي الخطأ مباشرة
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "fallback_secret") as {
      id: number;
      name: string;
      role: string;
    };

    return { user: payload }; // ⚡ مهم جداً
  } catch (err) {
    console.error("JWT verify error:", err);
    return { user: null }; // بدل رمي الخطأ
  }
}

export type Context = inferAsyncReturnType<typeof createTRPCContext>;
