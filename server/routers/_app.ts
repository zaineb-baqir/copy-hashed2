import { initTRPC } from "@trpc/server";
import type { Context } from "../context";
import { TRPCError } from "@trpc/server";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next();
});

// استيراد routers أخرى
import { userRouter } from "./user";
import { orgRouter } from "./org";
import { employeeRouter } from "./employee";
import { infoSystemRouter } from "./infosystem";
import { timeAllowenceRouter } from "./timeallowence"; 
import { vacationRouter } from "./vacation";
export const appRouter = router({
  user: userRouter,
  org: orgRouter,
  employee: employeeRouter,
  infoSystem: infoSystemRouter,
  timeAllowence: timeAllowenceRouter,
  vacation: vacationRouter,
});

// نوع الـ router للاستخدام بالـ client
export type AppRouter = typeof appRouter;
