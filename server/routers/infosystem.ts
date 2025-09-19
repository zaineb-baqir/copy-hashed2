import { router, protectedProcedure } from "../trpc";
import { db } from "../../lib/db";
import { infosystem } from "../../drizzle/schema";
import { z } from "zod";

export const infoSystemRouter = router({
  // إضافة سجل جديد
  addLog: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        userId: z.number(),
        doneby: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [newLog] = await db.insert(infosystem).values({
        description: input.description,
        userId: input.userId,
        doneby: input.doneby || "",
      });
      return newLog;
    }),

  // جلب كل السجلات
  getLogs: protectedProcedure.query(async () => {
    const logs = await db
      .select({
        id: infosystem.id,
        description: infosystem.description,
        userId: infosystem.userId,
        doneby: infosystem.doneby,
        createdAt: infosystem.createdAt,
      })
      .from(infosystem);

    return logs;
  }),
});
