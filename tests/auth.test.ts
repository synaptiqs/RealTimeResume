import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/session";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-that-is-long-enough-to-pass";
});

describe("password hashing", () => {
  it("hashes and verifies a correct password", async () => {
    const hash = await hashPassword("hunter2-long");
    expect(hash).not.toBe("hunter2-long");
    expect(await verifyPassword("hunter2-long", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-horse");
    expect(await verifyPassword("wrong-horse", hash)).toBe(false);
  });
});

describe("session tokens", () => {
  it("round-trips a valid session", async () => {
    const token = await createSessionToken({
      userId: "user_123",
      email: "a@b.com",
    });
    const payload = await verifySessionToken(token);
    expect(payload).toEqual({ userId: "user_123", email: "a@b.com" });
  });

  it("rejects a tampered token", async () => {
    const token = await createSessionToken({
      userId: "user_123",
      email: "a@b.com",
    });
    const tampered = token.slice(0, -2) + "xy";
    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it("rejects garbage", async () => {
    expect(await verifySessionToken("not-a-jwt")).toBeNull();
  });
});
