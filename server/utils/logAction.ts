import { db } from "../../lib/db";
import { infosystem } from "../../drizzle/schema";

/**
 * دالة تسجيل Log في جدول infosystem
 */
export async function logAction(
  userId: number,
  doneby: string,
  description: string
) {
  // مع MySQL ماكو returning، فنرجع الـ id بس
  const insertedId = await db
    .insert(infosystem)
    .values({
      userId,
      doneby,
      description,
    })
    .$returningId();

  return { id: insertedId };
}
