// server/routers/infosystem.ts
import { router, protectedProcedure } from "../trpc";
import { db } from "../../lib/db";
import { infosystem } from "../../drizzle/schema";
import { z } from "zod";
import { desc } from "drizzle-orm";

export const infoSystemRouter = router({
  addLog: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        doneby: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("User not found");

      const insertedId = await db.insert(infosystem).values({
        description: input.description,
        userId: ctx.user.id,
        doneby: input.doneby || ctx.user.name,
      }).$returningId();

      return { id: insertedId };
    }),
    
  getLogs: protectedProcedure.query(async () => {
    const logs = await db
      .select({
        id: infosystem.id,
        description: infosystem.description,
        userId: infosystem.userId,
        doneby: infosystem.doneby,
        createdAt: infosystem.createdAt,
      })
      .from(infosystem)
      .orderBy(desc(infosystem.createdAt));
    return logs;
  }),
});
