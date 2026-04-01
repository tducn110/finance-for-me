// apps/api/src/index.ts
// Hono.js entry point — Vercel Edge Runtime
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRoutes }        from "./routes/auth";
import { financeRoutes }     from "./routes/finance";
import { transactionRoutes } from "./routes/transactions";
import { goalRoutes }        from "./routes/goals";
import { billRoutes }        from "./routes/bills";
import { walletRoutes }      from "./routes/wallet";
import { authMiddleware }    from "./middleware/auth";
import { securityHeaders }   from "./middleware/security-headers";
import { errorHandler }      from "./middleware/error";

const app = new Hono().basePath("/api");

// ── Global middleware ────────────────────────────────────────────
app.use("*", logger());
app.use("*", securityHeaders);
app.use("*", cors({
  origin: process.env.CLIENT_URL ?? "http://localhost:3000",
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// ── Public routes (no JWT required) ─────────────────────────────
app.route("/auth", authRoutes);

// ── Protected routes (JWT required) ─────────────────────────────
app.use("/*", authMiddleware);
app.route("/finance",      financeRoutes);
app.route("/transactions", transactionRoutes);
app.route("/goals",        goalRoutes);
app.route("/bills",        billRoutes);
app.route("/wallet",       walletRoutes);

// ── Health check ─────────────────────────────────────────────────
app.get("/ping", (c) => c.json({ success: true, data: "pong" }));

// ── Global error handler ─────────────────────────────────────────
app.onError(errorHandler);

export default app;
