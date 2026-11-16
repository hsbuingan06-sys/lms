import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const lmsCoursesTable = pgTable("lms_courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull(),
  duration: text("duration").notNull(),
  lessons: integer("lessons").notNull(),
  enrolled: integer("enrolled").notNull().default(0),
  progress: real("progress").notNull().default(0),
  status: text("status").notNull().default("Đang hoạt động"),
  format: text("format").notNull().default("Native"),
  accent: text("accent").notNull().default("teal"),
});

export const lmsLearnersTable = pgTable("lms_learners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  team: text("team").notNull(),
  points: integer("points").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  progress: real("progress").notNull().default(0),
  activeCourse: text("active_course").notNull().default("Chưa ghi danh"),
  lastActive: text("last_active").notNull().default("Chưa hoạt động"),
});

export const lmsLearningPathsTable = pgTable("lms_learning_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  description: text("description").notNull(),
  courses: integer("courses").notNull(),
  courseTitles: jsonb("course_titles").$type<string[]>().notNull().default([]),
  duration: text("duration").notNull(),
  completion: real("completion").notNull().default(0),
  learners: integer("learners").notNull().default(0),
  accent: text("accent").notNull().default("teal"),
});

export const lmsEnrollmentsTable = pgTable(
  "lms_enrollments",
  {
    id: serial("id").primaryKey(),
    learnerId: integer("learner_id")
      .notNull()
      .references(() => lmsLearnersTable.id, { onDelete: "cascade" }),
    courseId: integer("course_id")
      .notNull()
      .references(() => lmsCoursesTable.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("Đang học"),
    completedLessonIds: jsonb("completed_lesson_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("lms_enrollments_learner_course_unique").on(
      table.learnerId,
      table.courseId,
    ),
  ],
);

export const lmsCertificatesTable = pgTable("lms_certificates", {
  id: serial("id").primaryKey(),
  learner: text("learner").notNull(),
  course: text("course").notNull(),
  serial: text("serial").notNull().unique(),
  issuedAt: text("issued_at").notNull(),
  status: text("status").notNull().default("Đã cấp"),
});

export const lmsActivitiesTable = pgTable("lms_activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  time: text("time").notNull(),
  kind: text("kind").notNull(),
});

export const lmsBadgesTable = pgTable(
  "lms_badges",
  {
    id: serial("id").primaryKey(),
    learnerId: integer("learner_id")
      .notNull()
      .references(() => lmsLearnersTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    icon: text("icon").notNull(),
    awardedAt: text("awarded_at").notNull(),
  },
  (table) => [
    uniqueIndex("lms_badges_learner_name_unique").on(
      table.learnerId,
      table.name,
    ),
  ],
);

export const lmsXapiEventsTable = pgTable("lms_xapi_events", {
  id: serial("id").primaryKey(),
  learnerId: integer("learner_id")
    .notNull()
    .references(() => lmsLearnersTable.id, { onDelete: "cascade" }),
  verb: text("verb").notNull(),
  objectId: text("object_id").notNull(),
  score: real("score").notNull(),
  timestamp: text("timestamp").notNull(),
  raw: jsonb("raw").$type<Record<string, unknown>>(),
});

export const insertLmsCourseSchema = createInsertSchema(lmsCoursesTable).omit({
  id: true,
});
export const insertLmsLearnerSchema = createInsertSchema(
  lmsLearnersTable,
).omit({ id: true });
export const insertLmsLearningPathSchema = createInsertSchema(
  lmsLearningPathsTable,
).omit({ id: true });
export const insertLmsEnrollmentSchema = createInsertSchema(
  lmsEnrollmentsTable,
).omit({ id: true, createdAt: true });
export const insertLmsCertificateSchema = createInsertSchema(
  lmsCertificatesTable,
).omit({ id: true });
export const insertLmsActivitySchema = createInsertSchema(
  lmsActivitiesTable,
).omit({ id: true });
export const insertLmsBadgeSchema = createInsertSchema(lmsBadgesTable).omit({
  id: true,
});
export const insertLmsXapiEventSchema = createInsertSchema(
  lmsXapiEventsTable,
).omit({ id: true });

export type LmsCourse = typeof lmsCoursesTable.$inferSelect;
export type LmsLearner = typeof lmsLearnersTable.$inferSelect;
export type LmsLearningPath = typeof lmsLearningPathsTable.$inferSelect;
export type LmsEnrollment = typeof lmsEnrollmentsTable.$inferSelect;
export type LmsCertificate = typeof lmsCertificatesTable.$inferSelect;
export type LmsBadge = typeof lmsBadgesTable.$inferSelect;
export type LmsXapiEvent = typeof lmsXapiEventsTable.$inferSelect;
export type LmsCourseInput = z.infer<typeof insertLmsCourseSchema>;
