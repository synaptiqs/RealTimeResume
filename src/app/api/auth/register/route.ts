import { z } from "zod";
import { registerUser, startSession } from "@/lib/auth";
import { error, json } from "@/lib/http";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().max(120).optional(),
  goal: z
    .enum(["recent-grad", "career-change", "returning-parent", "level-up"])
    .optional(),
});

export async function POST(req: Request) {
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

  try {
    const user = await registerUser(parsed.data);
    await startSession(user);
    return json({ user }, 201);
  } catch (e) {
    return error(e instanceof Error ? e.message : "Registration failed", 409);
  }
}
