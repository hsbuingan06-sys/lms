import crypto from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { db, lmsLearnersTable, lmsSessionsTable, type LmsLearner } from "../db";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash?: string | null): boolean {
  if (!combinedHash || !combinedHash.includes(":")) return false;
  const [salt, originalHash] = combinedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[parts.length - 2]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function getUserTitle(role: string): string {
  if (role === "admin") return "Quản trị viên hệ thống";
  if (role === "lecturer") return "Giảng viên phụ trách";
  return "Học viên";
}

export function sanitizeUser(learner: LmsLearner) {
  return {
    id: learner.id,
    name: learner.name,
    email: learner.email,
    role: (learner.role || "student") as "student" | "lecturer" | "admin",
    team: learner.team,
    avatar: getAvatarInitials(learner.name),
    title: getUserTitle(learner.role || "student"),
    points: learner.points,
    streak: learner.streak,
    progress: learner.progress,
    activeCourse: learner.activeCourse,
  };
}

export async function createSession(userId: number): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 ngày
  await db.insert(lmsSessionsTable).values({
    token,
    userId,
    expiresAt,
  });
  return token;
}

export async function validateSessionToken(token: string) {
  if (!token) return null;
  const now = new Date().toISOString();
  const sessions = await db
    .select()
    .from(lmsSessionsTable)
    .where(and(eq(lmsSessionsTable.token, token), gt(lmsSessionsTable.expiresAt, now)))
    .limit(1);

  const session = sessions[0];
  if (!session) return null;

  const users = await db
    .select()
    .from(lmsLearnersTable)
    .where(eq(lmsLearnersTable.id, session.userId))
    .limit(1);

  const user = users[0];
  if (!user) return null;

  return sanitizeUser(user);
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(lmsSessionsTable).where(eq(lmsSessionsTable.token, token));
}
