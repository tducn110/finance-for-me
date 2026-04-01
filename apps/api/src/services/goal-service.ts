// apps/api/src/services/goal-service.ts
// Goal CRUD + checkAndCompleteGoal — replaces trg_goals_auto_complete
import Decimal from "decimal.js";
import { db, goals, notifications } from "@finance/db";
import { eq, and, isNull } from "drizzle-orm";
import type { InsertGoal, ContributeGoal } from "@finance/shared-schemas";

export async function getActiveGoals(userId: string) {
  return db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), isNull(goals.deletedAt)));
}

export async function createGoal(userId: string, input: InsertGoal) {
  const [result] = await db.insert(goals).values({
    userId,
    name: input.name,
    icon: input.icon ?? "🎯",
    targetAmount: input.targetAmount,
    monthlyContribution: input.monthlyContribution ?? "0.00",
    deadline: input.deadline ?? null,
    priority: input.priority ?? 1,
    notes: input.notes ?? null,
  });

  const id = String((result as any).insertId);
  const [goal] = await db.select().from(goals).where(eq(goals.id, id)).limit(1);
  return goal;
}

// Contribute savings to a goal + auto-complete check
// Double-Dip Guard: không cho contribute vào goal đã completed/cancelled
export async function contributeToGoal(userId: string, goalId: string, input: ContributeGoal) {
  const [goal] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId), isNull(goals.deletedAt)))
    .limit(1);

  if (!goal) throw Object.assign(new Error("Mục tiêu không tồn tại"), { code: "NOT_FOUND" });

  // Double-Dip Guard
  if (goal.status === "completed" || goal.status === "cancelled") {
    throw Object.assign(
      new Error(`Không thể thêm tiền vào mục tiêu đã ${goal.status === "completed" ? "hoàn thành" : "hủy"}`),
      { code: "GOAL_INACTIVE" },
    );
  }

  const newSaved = new Decimal(goal.currentSaved).plus(new Decimal(input.amount));
  const target   = new Decimal(goal.targetAmount);
  const isComplete = newSaved.gte(target);

  await db.update(goals).set({
    currentSaved: newSaved.toFixed(2),
    ...(isComplete && { status: "completed", completedAt: new Date() }),
    updatedAt: new Date(),
  }).where(eq(goals.id, goalId));

  // Create completion notification (replaces trg_goals_auto_complete)
  if (isComplete) {
    await db.insert(notifications).values({
      userId,
      type: "goal_completed",
      title: "🎉 Mục tiêu hoàn thành!",
      body: `Chúc mừng! Bạn đã đạt mục tiêu "${goal.name}"`,
    });
  }

  const [updated] = await db.select().from(goals).where(eq(goals.id, goalId)).limit(1);
  return updated;
}

export async function deleteGoal(userId: string, goalId: string) {
  const [goal] = await db.select().from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId), isNull(goals.deletedAt)))
    .limit(1);
  if (!goal) throw Object.assign(new Error("Không tìm thấy mục tiêu"), { code: "NOT_FOUND" });
  await db.update(goals).set({ deletedAt: new Date() }).where(eq(goals.id, goalId));
}
