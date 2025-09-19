import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../lib/db";
import { vacation, vacationBalance } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { logAction } from "../utils/logAction"; // ⬅️ استدعاء دالة logAction

const diffInDays = (start: Date, end: Date) => {
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const vacationRouter = router({
  createVacation: protectedProcedure
    .input(
      z.object({
        employeeId: z.number(),
        departmentId: z.number(),
        sectionId: z.number(),
        dateStart: z.string(),
        dateEnd: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const startDate = new Date(input.dateStart);
      const endDate = new Date(input.dateEnd);
      const daysRequested = diffInDays(startDate, endDate);

      if (daysRequested <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "❌ تاريخ الإجازة غير صالح",
        });
      }

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const monthlyAllowance = 2;

      let [balanceRecord] = await db.select()
        .from(vacationBalance)
        .where(eq(vacationBalance.employeeId, input.employeeId))
        .limit(1);

      if (!balanceRecord) {
        await db.insert(vacationBalance).values({
          employeeId: input.employeeId,
          balance: 0,
          lastUpdatedMonth: currentMonth,
        });
        [balanceRecord] = await db.select()
          .from(vacationBalance)
          .where(eq(vacationBalance.employeeId, input.employeeId))
          .limit(1);
      } else {
        if (balanceRecord.lastUpdatedMonth < currentMonth) {
          const monthsToAdd = currentMonth - balanceRecord.lastUpdatedMonth;
          const newBalance = balanceRecord.balance + monthsToAdd * monthlyAllowance;

          await db.update(vacationBalance)
            .set({ balance: newBalance, lastUpdatedMonth: currentMonth })
            .where(eq(vacationBalance.employeeId, input.employeeId));

          balanceRecord.balance = newBalance;
          balanceRecord.lastUpdatedMonth = currentMonth;
        }
      }

      if (daysRequested > balanceRecord.balance) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `❌ لا يمكن إضافة هذه الإجازة. الرصيد المتاح: ${balanceRecord.balance} يوم.`,
        });
      }

      await db.insert(vacation).values({
        employeeId: input.employeeId,
        departmentId: input.departmentId,
        sectionId: input.sectionId,
        dateStart: startDate,
        dateEnd: endDate,
        reason: input.reason || null,
      });

      const updatedBalance = balanceRecord.balance - daysRequested;
      await db.update(vacationBalance)
        .set({ balance: updatedBalance })
        .where(eq(vacationBalance.employeeId, input.employeeId));

      // ⬅️ سجل العملية في infosystem
      await logAction(
        ctx.user.id,
        ctx.user.name,
        `قدم طلب إجازة للموظف ID=${input.employeeId} من ${input.dateStart} إلى ${input.dateEnd}`
      );

      return { message: "✅ تم إضافة الإجازة بنجاح.", remainingBalance: updatedBalance };
    }),

  getAllVacations: protectedProcedure.query(async () => {
    return db.select().from(vacation);
  }),

  getVacationsByEmployee: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      return db.select().from(vacation).where(eq(vacation.employeeId, input.employeeId));
    }),

  getEmployeeBalance: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const monthlyAllowance = 2;

      const [balanceRecord] = await db.select()
        .from(vacationBalance)
        .where(eq(vacationBalance.employeeId, input.employeeId))
        .limit(1);

      if (!balanceRecord) {
        await db.insert(vacationBalance).values({
          employeeId: input.employeeId,
          balance: 0,
          lastUpdatedMonth: currentMonth,
        });
        return 0;
      } else {
        if (balanceRecord.lastUpdatedMonth < currentMonth) {
          const monthsToAdd = currentMonth - balanceRecord.lastUpdatedMonth;
          const newBalance = balanceRecord.balance + monthsToAdd * monthlyAllowance;

          await db.update(vacationBalance)
            .set({ balance: newBalance, lastUpdatedMonth: currentMonth })
            .where(eq(vacationBalance.employeeId, input.employeeId));

          return newBalance;
        } else {
          return balanceRecord.balance;
        }
      }
    }),

  adjustEmployeeBalance: protectedProcedure
    .input(z.object({ employeeId: z.number(), adjustment: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [record] = await db.select().from(vacationBalance).where(eq(vacationBalance.employeeId, input.employeeId)).limit(1);
      if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "الموظف غير موجود" });

      const newBalance = record.balance + input.adjustment;
      await db.update(vacationBalance)
        .set({ balance: newBalance })
        .where(eq(vacationBalance.employeeId, input.employeeId));

      // ⬅️ سجل العملية
      await logAction(
        ctx.user.id,
        ctx.user.name,
        `تم تعديل رصيد إجازة الموظف ID=${input.employeeId} بمقدار ${input.adjustment} يوم`
      );

      return { newBalance };
    }),
});
