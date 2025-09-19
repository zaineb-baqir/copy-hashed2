// server/routers/employee.ts
import { z } from "zod";
import { router, protectedProcedure } from "../../server/trpc";
import { db } from "../../lib/db";
import { employee, workingdays, section, department, vacation, timeallowenc } from "../../drizzle/schema";
import { asc, eq } from "drizzle-orm";

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
  .mutation(async ({ input }) => {
    const { id, workingDays } = input;

    // تحديث بيانات الموظف
    await db.update(employee).set({ ...input }).where(eq(employee.id, id));

    // تحديث أيام العمل إذا موجودة
    if (workingDays) {
      await Promise.all(
        workingDays.map((shift) => {
          if (shift.id) {
            return db.update(workingdays)
              .set({ startshift: shift.startshift, endshift: shift.endshift })
              .where(eq(workingdays.id, shift.id));
          }
          return Promise.resolve(); // لتجنب تمرير undefined
        })
      );
    }

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
    .mutation(async ({ input }) => {
      const [newEmployee] = await db.insert(employee).values({
        name: input.name,
        privilege: input.privilege,
        sectionId: input.sectionId,
        departmentId: input.departmentId,
      }).$returningId();

      // إدخال أيام العمل
      const workingDaysData = input.workingDays.map((wd) => ({
        day: wd.day,
        startshift: wd.startShift,
        endshift: wd.endShift,
        employeeId: newEmployee.id,
      }));
      await db.insert(workingdays).values(workingDaysData);

      return { employeeId: newEmployee.id };
    }),

  // =================== جلب كل الموظفين ===================
  getAll: protectedProcedure.query(async () => {
    return db.select().from(employee);
  }),

  // =================== جلب كل ايام العمل ===================
  getWorkingDays: protectedProcedure.query(async () => {
    return db.select().from(workingdays);
  }),

  // =================== جلب أيام العمل حسب الموظف ===================
 getDayByEmployee: protectedProcedure
  .input(z.object({ employeeId: z.number() }))
  .query(async ({ input }) => {
    return db.query.workingdays.findMany({
      where: (t: typeof workingdays) => eq(t.employeeId, input.employeeId),
      columns: {
        id: true,
        day: true,
        startshift: true,
        endshift: true,
      },
      orderBy: (t: typeof workingdays) => asc(t.day),
    });
  }),
  // =================== جلب بيانات الموظف حسب ال id ===================
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      const emp = await db.query.employee.findFirst({ where: eq(employee.id, id) });
      if (!emp) return null;

      const [departmentData, sectionData, workDays, vacationData, timeAllowanceData] = await Promise.all([
        emp.departmentId ? db.query.department.findFirst({ where: eq(department.id, emp.departmentId) }) : null,
        emp.sectionId ? db.query.section.findFirst({ where: eq(section.id, emp.sectionId) }) : null,
        db.query.workingdays.findMany({ where: eq(workingdays.employeeId, id) }),
        db.query.vacation.findMany({ where: eq(vacation.employeeId, id) }),
        db.query.timeallowenc.findMany({ where: eq(timeallowenc.employeeId, id) }),
      ]);

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
    .mutation(async ({ input }) => {
      await db.delete(employee).where(eq(employee.id, input.id));
      return { success: true };
    }),
});
