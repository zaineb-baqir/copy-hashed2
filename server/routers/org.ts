import { router, protectedProcedure } from "../../server/trpc";
import { db } from "../../lib/db";
import { department, section, employee, workingdays } from "../../drizzle/schema";
import { like, eq, and } from "drizzle-orm";
import { z } from "zod";

export const orgRouter = router({
  updateSection: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string() }))
    .mutation(async ({ input }) => {
      await db.update(section).set({ name: input.name }).where(eq(section.id, input.id));
      return { success: true };
    }),

  updateDepartment: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string() }))
    .mutation(async ({ input }) => {
      await db.update(department).set({ name: input.name }).where(eq(department.id, input.id));
      return { success: true };
    }),

  search: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const q = `%${input}%`;

      const sectionsResult = await db.select().from(section).where(like(section.name, q));
      const departmentsResult = await db.select().from(department).where(like(department.name, q));
      const employeesResult = await db.select().from(employee).where(like(employee.name, q));
      const daysResult = await db.selectDistinct({ day: workingdays.day }).from(workingdays).where(like(workingdays.day, q));

      return {
        sections: sectionsResult,
        departments: departmentsResult,
        employees: employeesResult,
        days: daysResult,
      };
    }),

  getEmployeesByDay: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return db
        .select({
          id: employee.id,
          fullName: employee.name,
          day: workingdays.day,
          startshift: workingdays.startshift,
          endshift: workingdays.endshift,
        })
        .from(workingdays)
        .innerJoin(employee, eq(workingdays.employeeId, employee.id))
        .where(eq(workingdays.day, input));
    }),

  getSections: protectedProcedure.query(async () => db.select().from(section)),

  getDepartmentsBySection: protectedProcedure
    .input(z.number())
    .query(async ({ input: sectionId }) => db.select().from(department).where(eq(department.sectionId, sectionId))),

  getEmployeeByDepartment: protectedProcedure
    .input(z.object({ departmentId: z.number(), sectionId: z.number().optional() }))
    .query(async ({ input }) => {
      return db
        .select({
          id: employee.id,
          name: employee.name,
          privilege: employee.privilege,
          departmentId: employee.departmentId,
          sectionId: employee.sectionId,
        })
        .from(employee)
        .where(
          input.sectionId
            ? eq(employee.sectionId, input.sectionId)
            : eq(employee.departmentId, input.departmentId)
        );
    }),

  addSections: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const existing = await db.select().from(section).where(eq(section.name, input.name));
      if (existing.length > 0) throw new Error("❌ القسم موجود مسبقًا");
      const [newSection] = await db.insert(section).values({ name: input.name });
      return newSection;
    }),

  getDepartments: protectedProcedure.query(async () => db.select().from(department)),

  addDepartment: protectedProcedure
    .input(z.object({ name: z.string().min(1), sectionId: z.number() }))
    .mutation(async ({ input }) => {
      const existing = await db.select().from(department).where(and(eq(department.name, input.name), eq(department.sectionId, input.sectionId)));
      if (existing.length > 0) throw new Error("❌ الشعبة موجودة مسبقًا ضمن هذا القسم");
      const [newDepartment] = await db.insert(department).values({ name: input.name, sectionId: input.sectionId });
      return newDepartment;
    }),

  transferEmployee: protectedProcedure
    .input(z.object({ employeeId: z.number(), newSectionId: z.number(), newDepartmentId: z.number() }))
    .mutation(async ({ input }) => {
      await db.update(employee).set({ sectionId: input.newSectionId, departmentId: input.newDepartmentId }).where(eq(employee.id, input.employeeId));
    }),

  transferDepartment: protectedProcedure
    .input(z.object({ departmentId: z.number(), newSectionId: z.number() }))
    .mutation(async ({ input }) => {
      await db.update(department).set({ sectionId: input.newSectionId }).where(eq(department.id, input.departmentId));
      await db.update(employee).set({ sectionId: input.newSectionId }).where(eq(employee.departmentId, input.departmentId));
    }),

  getAllDepartments: protectedProcedure.query(async () => db.select().from(department)),

  deleteDepartment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const employeesInDept = await db.select().from(employee).where(eq(employee.departmentId, input.id));
      if (employeesInDept.length > 0) throw new Error("❌ لا يمكن حذف الشعبة لأنها تحتوي على موظفين");
      return db.delete(department).where(eq(department.id, input.id));
    }),

  deleteSection: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const childDepartments = await db.select().from(department).where(eq(department.sectionId, input.id));
      if (childDepartments.length > 0) throw new Error("❌ لا يمكن حذف القسم لأنه يحتوي على شعب");

      const employeesInSection = await db.select().from(employee).where(eq(employee.sectionId, input.id));
      if (employeesInSection.length > 0) throw new Error("❌ لا يمكن حذف القسم لأنه يحتوي على موظفين");

      return db.delete(section).where(eq(section.id, input.id));
    }),

  getDaysWithEmployees: protectedProcedure.query(async () => {
    return db
      .select({ day: workingdays.day, employeeId: employee.id, employeeName: employee.name })
      .from(workingdays)
      .leftJoin(employee, eq(workingdays.employeeId, employee.id));
  }),
});
