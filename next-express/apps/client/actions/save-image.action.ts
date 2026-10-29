"use server";
import { db } from "@/db";
import { images } from "@/db/schema";

export async function saveImage(data: {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
}) {
  // TODO: check auth
  const [saved] = await db.insert(images).values(data).returning();
  return saved;
}
