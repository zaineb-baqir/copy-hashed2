import { mysqlTable, int, varchar, text, time, date, datetime} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

/**
 * users
 */
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 191 }).notNull(),
  password: varchar("password", { length: 191 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
});

/**
 * section
 */
export const section = mysqlTable("section", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 191 }).notNull(),
});

/**
 * department
 */
export const department = mysqlTable("department", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 191 }).notNull(),
  sectionId: int("sectionId"),
});

/**
 * employee
 */
export const employee = mysqlTable("employee", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 191 }).notNull(),
  privilege: varchar("privilege", { length: 191 }).notNull(),
  sectionId: int("sectionId").notNull(),
  departmentId: int("departmentId").notNull(),
});

/**
 * workingdays
 */
export const workingdays = mysqlTable("workingdays", {
  id: int("id").primaryKey().autoincrement(),
  day: varchar("day", { length: 50 }).notNull(),
  startshift: time("startshift").notNull(),
  endshift: time("endshift").notNull(),
  employeeId: int("employeeId").notNull(),
});

/**
 * vacation
 */
export const vacation = mysqlTable("vacations", {
  id: int("id").primaryKey().autoincrement(),
  employeeId: int("employeeId").notNull(),
  departmentId: int("departmentId").notNull(),
  sectionId: int("sectionId").notNull(),
  dateStart: date("dateStart").notNull(),
  dateEnd: date("dateEnd").notNull(),
  reason: text("reason"),
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * vacation_balance
 */
export const vacationBalance = mysqlTable("vacation_balance", {
  id: int("id").primaryKey().autoincrement(),
  employeeId: int("employeeId").notNull(),
  balance: int("balance").notNull().default(2), // يبدأ برصيد 2 أيام
  lastUpdatedMonth: int("lastUpdatedMonth").notNull().default(new Date().getMonth() + 1), // تتبع الشهر الذي تمت فيه آخر إضافة
  updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

/**
 * timeallowenc (time allowances)
 */
export const timeallowenc = mysqlTable("timeallowenc", {
  id: int("id").primaryKey().autoincrement(),
  startTime: time("startTime").notNull(),
  endTime: time("endTime").notNull(),
  reason: text("reason"),
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
  employeeId: int("employeeId").notNull(),
  departmentId: int("departmentId").notNull(),
  sectionId: int("sectionId").notNull(),
});

/**
 * infosystem
 */
export const infosystem = mysqlTable("infosystem", {
  id: int("id").primaryKey().autoincrement(),
  description: text("description"),
  userId: int("userId").notNull(), // FK -> users.id
  doneby: varchar("doneby", { length: 100 }).default(""),
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
});

/* -------------------------
   Relations (using drizzle's relations helper)
   ------------------------- */

/* employee relations */
export const employeeRelations = relations(employee, ({ one, many }) => ({
  section: one(section, {
    fields: [employee.sectionId],
    references: [section.id],
  }),
  department: one(department, {
    fields: [employee.departmentId],
    references: [department.id],
  }),
  workingdays: many(workingdays),
  vacations: many(vacation),
  timeallowences: many(timeallowenc),
  // كل موظف اله أكثر من بصمة
}));



/* section relations */
export const sectionRelations = relations(section, ({ many }) => ({
  employees: many(employee),
  departments: many(department),
}));

/* department relations */
export const departmentRelations = relations(department, ({ one, many }) => ({
  section: one(section, {
    fields: [department.sectionId],
    references: [section.id],
  }),
  employees: many(employee),
}));

/* workingdays relations */
export const workingdaysRelations = relations(workingdays, ({ one }) => ({
  employee: one(employee, {
    fields: [workingdays.employeeId],
    references: [employee.id],
  }),
}));

/* vacation relations */
export const vacationRelations = relations(vacation, ({ one }) => ({
  employee: one(employee, {
    fields: [vacation.employeeId],
    references: [employee.id],
  }),
  department: one(department, {
    fields: [vacation.departmentId],
    references: [department.id],
  }),
  section: one(section, {
    fields: [vacation.sectionId],
    references: [section.id],
  }),
}));

/* timeallowenc relations */
export const timeallowencRelations = relations(timeallowenc, ({ one }) => ({
  employee: one(employee, {
    fields: [timeallowenc.employeeId],
    references: [employee.id],
  }),
  department: one(department, {
    fields: [timeallowenc.departmentId],
    references: [department.id],
  }),
  section: one(section, {
    fields: [timeallowenc.sectionId],
    references: [section.id],
  }),
}));

/* infosystem relations */
export const infosystemRelations = relations(infosystem, ({ one }) => ({
  user: one(users, {
    fields: [infosystem.userId],
    references: [users.id],
  }),
}));

/* vacation balance relations */
export const vacationBalanceRelations = relations(vacationBalance, ({ one }) => ({
  employee: one(employee, {
    fields: [vacationBalance.employeeId],
    references: [employee.id],
  }),
  
}));


