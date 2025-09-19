import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; 
import { username, admin } from "better-auth/plugins";
import { users } from "../drizzle/schema"; 

export const auth = betterAuth({
  plugins: [
    username(),   
    admin()    
  ],
  database: drizzleAdapter(db, {
    provider: "mysql",
    usePlural: true,
    schema: { users }, 
  }),
  usernameAndPassword: { enabled: true },
});
export const GET = auth.handler;
export const POST = auth.handler;
