import { mysqlTable, int, varchar, text, time, date, datetime, mysqlEnum, float, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
// db/schema/fingerprintDevices.ts
import { bigint, timestamp } from "drizzle-orm/mysql-core";

export const fingerprintDevices = mysqlTable("fingerprint_devices", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  employeeId: bigint("user_id", { mode: "number" }).notNull(),
  name: varchar("name", { length: 255 }),
  templateBase64: text("template_base64").notNull(),
  templateHash: varchar("template_hash", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendances = mysqlTable("attendances", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  employeeId: bigint("user_id", { mode: "number" }).notNull(),
  deviceId: bigint("device_id", { mode: "number" }),
  method: mysqlEnum("method", ["fake-emulator", "real-device", "webauthn", "qr"]).notNull().default("fake-emulator"),
  checkType: mysqlEnum("check_type", ["in", "out"]).notNull(),
  checkAt: timestamp("check_at").defaultNow().notNull(),
  score: float("score"),
  meta: json("meta"),
  status: mysqlEnum("status", ["present", "absent"]).default("present"), // ✅ إضافة العمود هنا
});
// جدول الموظفين الحاضرين
export const attendances_present = mysqlTable("attendances_present", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  employeeId: bigint("employee_id", { mode: "number" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  checkType: mysqlEnum("check_type", ["in", "out"]).notNull(),
  checkAt: timestamp("check_at").defaultNow().notNull(),
  status: mysqlEnum("status", ["present", "late"]).notNull(),
});

// جدول الموظفين الغائبين
export const attendances_absent = mysqlTable("attendances_absent", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  employeeId: bigint("employee_id", { mode: "number" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  reason: varchar("reason", { length: 255 }).default("لم يسجل بصمة"),
});


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
  fingerprintDevices: many(fingerprintDevices), // كل موظف اله أكثر من بصمة
}));

/* fingerprintDevices relations */
export const fingerprintDevicesRelations = relations(fingerprintDevices, ({ one, many }) => ({
  employee: one(employee, {
    fields: [fingerprintDevices.employeeId],
    references: [employee.id],
  }),
  attendances: many(attendances), // الجهاز الواحد اله سجلات حضور
}));

/* attendances relations */
export const attendancesRelations = relations(attendances, ({ one }) => ({
  employee: one(employee, {
    fields: [attendances.employeeId],
    references: [employee.id],
  }),
  device: one(fingerprintDevices, {
    fields: [attendances.deviceId],
    references: [fingerprintDevices.id],
  }),
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
/* attendances_present relations */
export const attendancesPresentRelations = relations(attendances_present, ({ one }) => ({
  employee: one(employee, {
    fields: [attendances_present.employeeId],
    references: [employee.id],
  }),
}));

/* attendances_absent relations */
export const attendancesAbsentRelations = relations(attendances_absent, ({ one }) => ({
  employee: one(employee, {
    fields: [attendances_absent.employeeId],
    references: [employee.id],
  }),
}));

