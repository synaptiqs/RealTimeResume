import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "./password";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
} from "./session";

export { SESSION_COOKIE };

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  goal: string | null;
}

/** Register a new user. Throws if the email is already taken. */
export async function registerUser(params: {
  email: string;
  password: string;
  name?: string;
  goal?: string;
}): Promise<AuthUser> {
  const email = params.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with that email already exists.");
  }
  const passwordHash = await hashPassword(params.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: params.name?.trim() || null,
      goal: params.goal || null,
    },
  });
  return { id: user.id, email: user.email, name: user.name, goal: user.goal };
}

/** Verify credentials. Returns the user or null on bad credentials. */
export async function authenticate(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, email: user.email, name: user.name, goal: user.goal };
}

/** Issue a session cookie for the given user. */
export async function startSession(user: {
  id: string;
  email: string;
}): Promise<void> {
  const token = await createSessionToken({ userId: user.id, email: user.email });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);
}

/** Clear the session cookie. */
export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Resolve the currently logged-in user from the session cookie, or null. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, goal: user.goal };
}

/** Throw if not authenticated; otherwise return the user. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}
