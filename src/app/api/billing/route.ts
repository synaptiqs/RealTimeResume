import { z } from "zod";
import { prisma } from "@/lib/db";
import { error, json, withUser } from "@/lib/http";

// DEMO billing toggle. There is no payment processor yet (out of scope, PRD §10);
// this lets the Free/Pro experience be exercised end to end. Replace with a real
// checkout (e.g. Stripe) that flips `isPro` on successful payment.
const schema = z.object({ action: z.enum(["upgrade", "downgrade"]) });

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
  if (!parsed.success) return error("Invalid input");

  const user = await prisma.user.update({
    where: { id: auth.user.id },
    data: { isPro: parsed.data.action === "upgrade" },
  });
  return json({ isPro: user.isPro });
}
