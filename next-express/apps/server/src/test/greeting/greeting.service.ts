import { findNameById } from "./greeting.query";

export async function getGreeting(id: string): Promise<string> {
  const name = await findNameById(id);
  if (!name) throw new Error("NOT_FOUND");
  return `Hello, ${name}!`;
}
