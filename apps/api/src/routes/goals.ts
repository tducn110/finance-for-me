// apps/api/src/routes/goals.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertGoalSchema, updateGoalSchema, contributeGoalSchema } from "@finance/shared-schemas";
import { getActiveGoals, createGoal, contributeToGoal, deleteGoal } from "../services/goal-service";
import { ok, created, err } from "../lib/response";
import { db, goals } from "@finance/db";
import { eq, and, isNull } from "drizzle-orm";

export const goalRoutes = new Hono<{ Variables: { userId: string } }>()

  .get("/", async (c) => {
    const data = await getActiveGoals(c.get("userId"));
    return ok(c, data);
  })

  .post("/", zValidator("json", insertGoalSchema), async (c) => {
    const goal = await createGoal(c.get("userId"), c.req.valid("json"));
    return created(c, goal);
  })

  .put("/:id", zValidator("json", updateGoalSchema), async (c) => {
    const { id } = c.req.param();
    const userId = c.get("userId");
    const input = c.req.valid("json");

    const [existing] = await db.select().from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId), isNull(goals.deletedAt))).limit(1);
    if (!existing) return err(c, 404, "NOT_FOUND", "Mục tiêu không tồn tại");

    await db.update(goals).set({ ...input, updatedAt: new Date() }).where(eq(goals.id, id));
    const [updated] = await db.select().from(goals).where(eq(goals.id, id)).limit(1);
    return ok(c, updated);
  })

  .post("/:id/contribute", zValidator("json", contributeGoalSchema), async (c) => {
    const { id } = c.req.param();
    try {
      const updated = await contributeToGoal(c.get("userId"), id, c.req.valid("json"));
      return ok(c, updated);
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      if (e.code === "GOAL_INACTIVE") return err(c, 409, "GOAL_INACTIVE", e.message);
      throw e;
    }
  })

  .delete("/:id", async (c) => {
    try {
      await deleteGoal(c.get("userId"), c.req.param("id"));
      return ok(c, { message: "Đã xóa mục tiêu" });
    } catch (e: any) {
      if (e.code === "NOT_FOUND") return err(c, 404, "NOT_FOUND", e.message);
      throw e;
    }
  });
