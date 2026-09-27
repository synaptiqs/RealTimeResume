import { z } from "zod";
import { createActivity, listActivities } from "@/lib/activities";
import { error, json, withUser } from "@/lib/http";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).default(""),
  occurredAt: z.string().datetime().optional(),
});

export async function GET() {
  const auth = await withUser();
  if (!("user" in auth)) return auth;
  const activities = await listActivities(auth.user.id);
  return json({ activities });
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

  const activity = await createActivity(auth.user.id, {
    title: parsed.data.title,
    description: parsed.data.description,
    occurredAt: parsed.data.occurredAt
      ? new Date(parsed.data.occurredAt)
      : undefined,
  });
  return json({ activity }, 201);
}
