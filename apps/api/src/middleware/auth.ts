// apps/api/src/middleware/auth.ts
// JWT verification middleware — attaches userId to context
import { createMiddleware } from "hono/factory";
import { verifyToken } from "../lib/jwt";
import { err } from "../lib/response";

type AuthVariables = { userId: string; userEmail: string };

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    // Read access token from HttpOnly cookie
    const token = getCookieValue(c.req.header("cookie") ?? "", "access_token");

    if (!token) {
      return err(c, 401, "UNAUTHORIZED", "Vui lòng đăng nhập");
    }

    try {
      const payload = await verifyToken(token);
      c.set("userId", payload.userId);
      c.set("userEmail", payload.email);
      await next();
    } catch {
      return err(c, 401, "TOKEN_INVALID", "Phiên đăng nhập đã hết hạn");
    }
  },
);

function getCookieValue(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match?.split("=").slice(1).join("=");
}
