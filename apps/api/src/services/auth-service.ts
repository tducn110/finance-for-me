// apps/api/src/services/auth-service.ts
// Auth operations — login, register, refresh, logout
// Passwords: bcryptjs cost=12. Tokens: jose (Edge-compatible).
// Refresh tokens: SHA-256 hashed before DB storage.
import bcrypt from "bcryptjs";
import { db, users, userSettings, cashWallet, refreshTokens } from "@finance/db";
import { eq, and, isNull, gt } from "drizzle-orm";
import { signAccessToken, signRefreshToken, verifyToken } from "../lib/jwt";

const BCRYPT_COST = 12;

// Hash a token for safe DB storage (SHA-256)
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function register(input: {
  email: string;
  password: string;
  fullName: string;
  username: string;
}) {
  // Check existing
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing) throw Object.assign(new Error("Email đã được sử dụng"), { code: "EMAIL_TAKEN" });

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

  // Atomic: create user + settings + wallet
  await db.transaction(async (tx) => {
    const [result] = await tx.insert(users).values({
      email: input.email,
      username: input.username,
      fullName: input.fullName,
      passwordHash,
    });

    const newUserId = String((result as any).insertId);

    // initializeNewUser — replaces trg_after_user_insert
    await tx.insert(userSettings).values({ userId: newUserId });
    await tx.insert(cashWallet).values({ userId: newUserId });
  });

  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  return user;
}

export async function login(
  email: string,
  password: string,
  deviceInfo?: string,
  ipAddress?: string,
) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  // Timing-safe: always run compare even if user not found
  const validPassword = user
    ? await bcrypt.compare(password, user.passwordHash)
    : await bcrypt.compare(password, "$2b$12$invalidhashtopreventtiming");

  if (!user || !validPassword) {
    throw Object.assign(new Error("Email hoặc mật khẩu không đúng"), { code: "INVALID_CREDENTIALS" });
  }

  if (!user.isActive) {
    throw Object.assign(new Error("Tài khoản đã bị khóa"), { code: "ACCOUNT_DISABLED" });
  }

  // Issue tokens
  const accessToken = await signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = await signRefreshToken({ userId: user.id, email: user.email });
  const tokenHash = await hashToken(refreshToken);

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash,
    deviceInfo: deviceInfo ?? null,
    ipAddress: ipAddress ?? null,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // Update lastLoginAt
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  return { accessToken, refreshToken, user };
}

export async function refreshAccessToken(incomingRefreshToken: string) {
  const payload = await verifyToken(incomingRefreshToken).catch(() => {
    throw Object.assign(new Error("Refresh token không hợp lệ"), { code: "INVALID_REFRESH" });
  });

  const tokenHash = await hashToken(incomingRefreshToken);

  const [stored] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!stored) throw Object.assign(new Error("Refresh token đã hết hạn"), { code: "REFRESH_EXPIRED" });

  return signAccessToken({ userId: payload.userId, email: payload.email });
}

export async function logout(incomingRefreshToken: string) {
  const tokenHash = await hashToken(incomingRefreshToken);
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, tokenHash));
}
