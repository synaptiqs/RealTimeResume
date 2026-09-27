import { z } from "zod";
import { addJournalEntry, listJournalEntries } from "@/lib/journal";
import { error, json, withUser } from "@/lib/http";

const schema = z.object({ content: z.string().min(1).max(5000) });

export async function GET() {
  const auth = await withUser();
  if (!("user" in auth)) return auth;
  const entries = await listJournalEntries(auth.user.id);
  return json({ entries });
}

export async function POST(req: Request) {
  const auth = await withUser();
  if (!("user" in auth)) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Entry cannot be empty");

  const entry = await addJournalEntry(auth.user.id, parsed.data.content);
  return json({ entry }, 201);
}
