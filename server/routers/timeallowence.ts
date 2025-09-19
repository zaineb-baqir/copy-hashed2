/* eslint-disable @typescript-eslint/no-explicit-any */
import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { db } from "../../lib/db";
import { sql } from "drizzle-orm";
import { timeallowenc } from "../../drizzle/schema";
import { startOfMonth, endOfMonth } from "date-fns";

export const timeAllowenceRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        employeeId: z.number(),
        sectionId: z.number(),
        departmentId: z.number(),
        startTime: z.string(),
        endTime: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { employeeId, sectionId, departmentId, startTime, endTime, reason } = input;

      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);
      const usedHours = (endHour + endMinute / 60) - (startHour + startMinute / 60);

      const [rows]: any = await db.execute(sql`
        SELECT SUM(TIMESTAMPDIFF(MINUTE, startTime, endTime))/60 as usedHours
        FROM timeallowenc
        WHERE employeeId = ${employeeId}
        AND startTime >= ${startOfMonth(new Date())}
        AND startTime <= ${endOfMonth(new Date())}
      `);

      const used = rows[0]?.usedHours || 0;
      const remaining = 4 - used;

      if (usedHours > remaining) {
        throw new Error(`❌ الرصيد غير كافي. المتبقي: ${remaining.toFixed(2)} ساعة`);
      }

      await db.insert(timeallowenc).values({
        employeeId,
        sectionId,
        departmentId,
        startTime,
        endTime,
        reason,
      });

      return { success: true, message: `تم تسجيل الزمنية. تبقى: ${(remaining - usedHours).toFixed(2)} ساعة` };
    }),

  getBalance: protectedProcedure
    .input(z.number())
    .query(async ({ input: employeeId }) => {
      const [rows]: any = await db.execute(sql`
        SELECT SUM(TIMESTAMPDIFF(MINUTE, startTime, endTime))/60 as usedHours
        FROM timeallowenc
        WHERE employeeId = ${employeeId}
        AND startTime >= ${startOfMonth(new Date())}
        AND startTime <= ${endOfMonth(new Date())}
      `);

      const used = rows[0]?.usedHours || 0;
      const remaining = 4 - used;
      return { allowed: 4, used, remaining: remaining > 0 ? remaining : 0 };
    }),
});
