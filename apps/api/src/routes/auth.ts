// apps/api/src/routes/auth.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertUserSchema, loginSchema } from "@finance/shared-schemas";
import { register, login, refreshAccessToken, logout } from "../services/auth-service";
import { db, users } from "@finance/db";
import { eq } from "drizzle-orm";
import { ok, created, err } from "../lib/response";

const COOKIE_OPTS = "HttpOnly; Secure; SameSite=Lax; Path=/";
const REFRESH_PATH = "Path=/api/auth/refresh";

export const authRoutes = new Hono()

  // POST /api/auth/register
  .post("/register", zValidator("json", insertUserSchema), async (c) => {
    try {
      const input = c.req.valid("json");
      const user = await register(input);
      return created(c, { id: user.id, email: user.email, fullName: user.fullName, username: user.username });
    } catch (e: any) {
      if (e.code === "EMAIL_TAKEN") return err(c, 409, "EMAIL_TAKEN", e.message);
      throw e;
    }
  })

  // POST /api/auth/login
  .post("/login", zValidator("json", loginSchema), async (c) => {
    try {
      const { email, password } = c.req.valid("json");
      const ip = c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip");
      const ua = c.req.header("user-agent");

      const { accessToken, refreshToken, user } = await login(email, password, ua, ip);

      // HttpOnly cookies — tokens never in response body
      c.header("Set-Cookie", `access_token=${accessToken}; Max-Age=900; ${COOKIE_OPTS}`);
      c.header("Set-Cookie", `refresh_token=${refreshToken}; Max-Age=2592000; ${COOKIE_OPTS}; ${REFRESH_PATH}`, true);

      return ok(c, {
        user: { id: user.id, email: user.email, fullName: user.fullName, username: user.username },
      });
    } catch (e: any) {
      if (e.code === "INVALID_CREDENTIALS") return err(c, 401, "INVALID_CREDENTIALS", e.message);
      if (e.code === "ACCOUNT_DISABLED") return err(c, 403, "ACCOUNT_DISABLED", e.message);
      throw e;
    }
  })

  // POST /api/auth/refresh
  .post("/refresh", async (c) => {
    const refreshToken = getCookieValue(c.req.header("cookie") ?? "", "refresh_token");
    if (!refreshToken) return err(c, 401, "NO_REFRESH_TOKEN", "Refresh token không tồn tại");

    try {
      const accessToken = await refreshAccessToken(refreshToken);
      c.header("Set-Cookie", `access_token=${accessToken}; Max-Age=900; ${COOKIE_OPTS}`);
      return ok(c, { message: "Token đã được làm mới" });
    } catch (e: any) {
      return err(c, 401, e.code ?? "REFRESH_FAILED", e.message);
    }
  })

  // POST /api/auth/logout
  .post("/logout", async (c) => {
    const refreshToken = getCookieValue(c.req.header("cookie") ?? "", "refresh_token");
    if (refreshToken) await logout(refreshToken).catch(() => {});

    // Clear both cookies
    c.header("Set-Cookie", `access_token=; Max-Age=0; ${COOKIE_OPTS}`);
    c.header("Set-Cookie", `refresh_token=; Max-Age=0; ${COOKIE_OPTS}; ${REFRESH_PATH}`, true);
    return ok(c, { message: "Đã đăng xuất" });
  })

  // GET /api/auth/me
  .get("/me", async (c) => {
    const token = getCookieValue(c.req.header("cookie") ?? "", "access_token");
    if (!token) return err(c, 401, "UNAUTHORIZED", "Chưa đăng nhập");

    const { verifyToken } = await import("../lib/jwt");
    const payload = await verifyToken(token).catch(() => null);
    if (!payload) return err(c, 401, "TOKEN_INVALID", "Phiên đăng nhập hết hạn");

    const [user] = await db.select({
      id: users.id, email: users.email, fullName: users.fullName,
      username: users.username, avatarUrl: users.avatarUrl,
      avatarText: users.avatarText, createdAt: users.createdAt,
    }).from(users).where(eq(users.id, payload.userId)).limit(1);

    if (!user) return err(c, 404, "NOT_FOUND", "Không tìm thấy người dùng");
    return ok(c, user);
  });

function getCookieValue(header: string, name: string) {
  return header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`))?.split("=").slice(1).join("=");
}
