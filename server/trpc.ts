import { initTRPC } from "@trpc/server";
import type { Context } from "../server/context";
import { TRPCError } from "@trpc/server";

const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next();
});
