import { router, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "../../lib/db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const userRouter = router({
  //================ login =================
  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      console.log("Login input:", input);

      const user = await db.query.users.findFirst({
        where: eq(users.name, input.username),
      });
      console.log("Found user:", user);

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
      console.log("Generated token:", token);

      return {
        token,
        user: { id: user.id, name: user.name, role: user.role },
      };
    }),

  //================ add user =================
  addUser: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        password: z.string().min(6),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.name, input.name),
      });

      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: "User already exists!" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      await db.insert(users).values({
        name: input.name,
        password: hashedPassword,
        role: input.role,
      });

      return { success: true, message: "User created successfully!" };
    }),

  //================ get all =================
  getAll: protectedProcedure.query(async () => {
    return db.query.users.findMany();
  }),

  //================ update user =================
  updateUser: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(3),
        password: z.string().optional(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.password) {
        input.password = await bcrypt.hash(input.password, 10);
      }
      await db.update(users)
        .set(input)
        .where(eq(users.id, input.id));

      return { success: true, message: "User updated successfully!" };
    }),

  //================ delete user =================
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(users)
        .where(eq(users.id, input.id));
      return { success: true };
    }),
});
