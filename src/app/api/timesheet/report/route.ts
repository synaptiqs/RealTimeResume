import { z } from "zod";
import { generateTimesheet } from "@/lib/timesheet";
import { error, json, withUser } from "@/lib/http";

const schema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  title: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  const auth = await withUser();
  if (!("user" in auth)) return auth;

  let body: unknown = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid input");

  const from = parsed.data.from ? new Date(parsed.data.from) : undefined;
  const to = parsed.data.to ? new Date(parsed.data.to) : undefined;
  if (from && Number.isNaN(from.getTime())) return error("Invalid 'from' date");
  if (to && Number.isNaN(to.getTime())) return error("Invalid 'to' date");

  const report = await generateTimesheet(auth.user.id, {
    from,
    to,
    title: parsed.data.title,
  });
  return json(report);
}
