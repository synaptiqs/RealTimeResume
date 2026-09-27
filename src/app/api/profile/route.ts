import { z } from "zod";
import { prisma } from "@/lib/db";
import { error, json, withUser } from "@/lib/http";

const schema = z.object({
  name: z.string().max(120).optional(),
  goal: z
    .enum(["recent-grad", "career-change", "returning-parent", "level-up"])
    .optional(),
});

/** Update the signed-in user's profile (name and chosen path/persona). */
export async function PATCH(req: Request) {
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
    data: {
      ...(parsed.data.name !== undefined
        ? { name: parsed.data.name.trim() || null }
        : {}),
      ...(parsed.data.goal !== undefined ? { goal: parsed.data.goal } : {}),
    },
  });

  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      goal: user.goal,
      isPro: user.isPro,
    },
  });
}
