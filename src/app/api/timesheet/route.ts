import { z } from "zod";
import { addTimeEntry, listTimeEntries } from "@/lib/timesheet";
import { error, json, withUser } from "@/lib/http";

const schema = z.object({
  date: z.string(), // YYYY-MM-DD or ISO
  hours: z.number().positive().max(24),
  project: z.string().max(120).optional(),
  description: z.string().min(1).max(2000),
});

export async function GET() {
  const auth = await withUser();
  if (!("user" in auth)) return auth;
  const entries = await listTimeEntries(auth.user.id);
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
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const date = new Date(parsed.data.date);
  if (Number.isNaN(date.getTime())) return error("Invalid date");

  try {
    const entry = await addTimeEntry(auth.user.id, {
      date,
      hours: parsed.data.hours,
      project: parsed.data.project,
      description: parsed.data.description,
    });
    return json({ entry }, 201);
  } catch (e) {
    return error(e instanceof Error ? e.message : "Could not add entry");
  }
}
