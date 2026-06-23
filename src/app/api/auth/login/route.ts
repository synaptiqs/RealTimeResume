import { z } from "zod";
import { authenticate, startSession } from "@/lib/auth";
import { error, json } from "@/lib/http";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
    return error("Email and password are required");
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    return error("Invalid email or password", 401);
  }

  await startSession(user);
  return json({ user });
}
