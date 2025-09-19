/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { router, protectedProcedure } from "../../server/trpc";
import { db } from "../../lib/db";
import { employee, workingdays, section, department, vacation, timeallowenc } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { logAction } from "../utils/logAction";  

// دالة مساعدة لتسجيل الأحداث بأمان
const safeLog = async (ctx: any, message: string) => {
  if (ctx?.user) {
    await logAction(ctx.user.id, ctx.user.name, message);
  }
};

export const employeeRouter = router({
  // =================== تحديث الموظف ===================
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        privilege: z.string().optional(),
        sectionId: z.number().optional(),
        departmentId: z.number().optional(),
        workingDays: z.array(
          z.object({
            id: z.number().optional(),
            day: z.string(),
            startshift: z.string(),
            endshift: z.string(),
          })
        ).optional(),
        vacation: z.array(
          z.object({
            id: z.number().optional(),
            type: z.string(),
            reason: z.string(),
            dateStart: z.string(),
            dateEnd: z.string(),
          })
        ).optional(),
        timeallowances: z.array(
          z.object({
            id: z.number().optional(),
            type: z.string(),
            reason: z.string(),
            startTime: z.string(),
            endTime: z.string(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, workingDays } = input;

      await db.update(employee).set({ ...input }).where(eq(employee.id, id));

      if (workingDays) {
        await Promise.all(
          workingDays.map((shift) => {
            if (shift.id) {
              return db.update(workingdays)
                .set({ startshift: shift.startshift, endshift: shift.endshift })
                .where(eq(workingdays.id, shift.id));
            }
            return Promise.resolve();
          })
        );
      }

      await safeLog(ctx, `عدل بيانات الموظف ID=${id}`);

      return { success: true };
    }),

  // =================== اضافة موظف ===================
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        privilege: z.string(),
        sectionId: z.number(),
        departmentId: z.number(),
        workingDays: z.array(
          z.object({
            day: z.string(),
            startShift: z.string(),
            endShift: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [newEmployee] = await db.insert(employee).values({
        name: input.name,
        privilege: input.privilege,
        sectionId: input.sectionId,
        departmentId: input.departmentId,
      }).$returningId();

      const workingDaysData = input.workingDays.map((wd) => ({
        day: wd.day,
        startshift: wd.startShift,
        endshift: wd.endShift,
        employeeId: newEmployee.id,
      }));
      await db.insert(workingdays).values(workingDaysData);

      await safeLog(ctx, `أضاف موظف جديد: ${input.name}`);

      return { employeeId: newEmployee.id };
    }),

  // =================== جلب كل الموظفين ===================
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const allEmployees = await db.select().from(employee);
    await safeLog(ctx, "عرض جميع الموظفين");
    return allEmployees;
  }),

  // =================== جلب كل ايام العمل ===================
  getWorkingDays: protectedProcedure.query(async ({ ctx }) => {
    const days = await db.select().from(workingdays);
    await safeLog(ctx, "عرض جميع أيام العمل");
    return days;
  }),

  // =================== جلب أيام العمل حسب الموظف ===================
  getDayByEmployee: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const result = await db.query.workingdays.findMany({
        where: (fields, { eq }) => eq(fields.employeeId, input.employeeId),
        columns: { id: true, day: true, startshift: true, endshift: true },
        orderBy: (fields, { asc }) => asc(fields.day),
      });
      await safeLog(ctx, `عرض أيام العمل للموظف ID=${input.employeeId}`);
      return result;
    }),

  // =================== جلب بيانات الموظف حسب ال id ===================
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input: id, ctx }) => {
      const emp = await db.query.employee.findFirst({ where: eq(employee.id, id) });
      if (!emp) return null;

      const [departmentData, sectionData, workDays, vacationData, timeAllowanceData] = await Promise.all([
        emp.departmentId ? db.query.department.findFirst({ where: eq(department.id, emp.departmentId) }) : null,
        emp.sectionId ? db.query.section.findFirst({ where: eq(section.id, emp.sectionId) }) : null,
        db.query.workingdays.findMany({ where: eq(workingdays.employeeId, id) }),
        db.query.vacation.findMany({ where: eq(vacation.employeeId, id) }),
        db.query.timeallowenc.findMany({ where: eq(timeallowenc.employeeId, id) }),
      ]);

      await safeLog(ctx, `عرض بيانات الموظف ID=${id}`);

      return {
        ...emp,
        departmentName: departmentData?.name || null,
        sectionName: sectionData?.name || null,
        workingDays: workDays,
        vacation: vacationData,
        timeallowances: timeAllowanceData,
      };
    }),

  // =================== حذف الموظف ===================
  deleteEmployee: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.delete(employee).where(eq(employee.id, input.id));
      await safeLog(ctx, `حذف موظف بالرقم ${input.id}`);
      return { success: true };
    }),
});
