/* eslint-disable @typescript-eslint/no-explicit-any */
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "../../lib/db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logAction } from "../utils/logAction";

// دالة مساعدة لتسجيل الأحداث بأمان
const safeLog = async (ctx: any, message: string) => {
  if (ctx?.user) {
    await logAction(ctx.user.id, ctx.user.name, message);
  }
};

export const userRouter = router({
  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.name, input.username),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });
      }
      if (!user.password) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "كلمة المرور غير موجودة" });
      }

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور غير صحيحة" });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role },
        process.env.JWT_SECRET ?? "fallback_secret",
        { expiresIn: "1d" }
      );

      await logAction(user.id, user.name, "تسجيل دخول للنظام");

      return {
        token,
        user: { id: user.id, name: user.name, role: user.role },
      };
    }),

  addUser: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        password: z.string().min(6),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.name, input.name),
      });

      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: "User already exists!" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const [newUserId] = await db.insert(users).values({
        name: input.name,
        password: hashedPassword,
        role: input.role,
      }).$returningId();

      await safeLog(ctx, `أضاف مستخدم جديد: ${input.name}`);

      return { success: true, message: "User created successfully!" };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const usersList = await db.query.users.findMany();
    await safeLog(ctx, `عرض قائمة جميع المستخدمين`);
    return usersList;
  }),

  updateUser: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(3),
        password: z.string().optional(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.password) {
        input.password = await bcrypt.hash(input.password, 10);
      }

      await db.update(users)
        .set(input)
        .where(eq(users.id, input.id));

      await safeLog(ctx, `عدل بيانات المستخدم ID=${input.id}`);

      return { success: true, message: "User updated successfully!" };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.delete(users)
        .where(eq(users.id, input.id));

      await safeLog(ctx, `حذف المستخدم ID=${input.id}`);

      return { success: true };
    }),
});
