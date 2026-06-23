import { NextResponse } from "next/server";
import { getCurrentUser, type AuthUser } from "@/lib/auth";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Resolve the current user for a route handler, or return a 401 response.
 * Usage:
 *   const auth = await withUser();
 *   if (auth instanceof NextResponse) return auth;
 *   // auth.user is available
 */
export async function withUser(): Promise<
  { user: AuthUser } | NextResponse
> {
  const user = await getCurrentUser();
  if (!user) return error("Not authenticated", 401);
  return { user };
}
