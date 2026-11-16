import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  db,
  lmsActivitiesTable,
  lmsBadgesTable,
  lmsCertificatesTable,
  lmsCoursesTable,
  lmsEnrollmentsTable,
  lmsLearnersTable,
  lmsLearningPathsTable,
  lmsXapiEventsTable,
} from "../db";
import {
  AutoEnrollLearnersBody,
  AutoEnrollLearnersResponse,
  CompleteLmsLessonBody,
  CompleteLmsLessonResponse,
  CreateLmsCourseBody,
  CreateLmsCourseResponse,
  GetLmsDashboardResponse,
  GetLmsLeaderboardResponse,
  ListLmsBadgesResponse,
  ListLmsCertificatesResponse,
  ListLmsCoursesResponse,
  ListLmsLearnersResponse,
  ListLmsLearningPathsResponse,
  ListLmsPluginsResponse,
  RecordXapiEventBody,
  RecordXapiEventResponse,
  UpdateLmsCourseBody,
  UpdateLmsCourseParams,
  UpdateLmsCourseResponse,
} from "../schemas";
import { ensureLmsSeeded } from "../lib/lms-seed";

const router: IRouter = Router();
const courseAccents = ["teal", "violet", "amber", "blue", "rose"];

router.get("/lms/dashboard", async (_req, res): Promise<void> => {
  await ensureLmsSeeded();
  const [activeCourseCount] = await db
    .select({ value: count() })
    .from(lmsCoursesTable)
    .where(eq(lmsCoursesTable.status, "Đang hoạt động"));
  const [learnerCount] = await db
    .select({ value: count() })
    .from(lmsLearnersTable);
  const [averageProgress] = await db
    .select({ value: sql<number>`coalesce(avg(${lmsLearnersTable.progress}), 0)` })
    .from(lmsLearnersTable);
  const [pendingCount] = await db
    .select({ value: count() })
    .from(lmsCertificatesTable)
    .where(eq(lmsCertificatesTable.status, "Chờ cấp"));
  const recentActivity = await db
    .select()
    .from(lmsActivitiesTable)
    .orderBy(desc(lmsActivitiesTable.id))
    .limit(6);
  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0);
  startDate.setUTCDate(startDate.getUTCDate() - 6);
  const events = await db
    .select({
      learnerId: lmsXapiEventsTable.learnerId,
      verb: lmsXapiEventsTable.verb,
      timestamp: lmsXapiEventsTable.timestamp,
    })
    .from(lmsXapiEventsTable)
    .where(gte(lmsXapiEventsTable.timestamp, startDate.toISOString()));
  const eventsByDate = new Map<
    string,
    { learners: Set<number>; completed: number }
  >();
  for (const event of events) {
    const dateKey = event.timestamp.slice(0, 10);
    const day = eventsByDate.get(dateKey) ?? {
      learners: new Set<number>(),
      completed: 0,
    };
    day.learners.add(event.learnerId);
    if (event.verb.includes("completed")) day.completed += 1;
    eventsByDate.set(dateKey, day);
  }
  const weekdayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const weeklyEngagement = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + index);
    const dateKey = date.toISOString().slice(0, 10);
    const day = eventsByDate.get(dateKey);
    return {
      day: weekdayLabels[date.getUTCDay()]!,
      active: day?.learners.size ?? 0,
      completed: day?.completed ?? 0,
    };
  });
  const data = GetLmsDashboardResponse.parse({
    activeCourses: Number(activeCourseCount?.value ?? 0),
    totalLearners: Number(learnerCount?.value ?? 0),
    completionRate: Math.round(Number(averageProgress?.value ?? 0)),
    pendingCertificates: Number(pendingCount?.value ?? 0),
    weeklyEngagement,
    recentActivity,
  });
  res.json(data);
});

router.get("/lms/courses", async (_req, res): Promise<void> => {
  await ensureLmsSeeded();
  const courses = await db
    .select()
    .from(lmsCoursesTable)
    .orderBy(desc(lmsCoursesTable.id));
  res.json(courses);
});

router.post("/lms/courses", async (req, res): Promise<void> => {
  await ensureLmsSeeded();
  const parsed = CreateLmsCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const instructorName = typeof req.body.instructorName === "string" && req.body.instructorName.trim()
    ? req.body.instructorName.trim()
    : "Cô Bui Ngan";
  const [course] = await db
    .insert(lmsCoursesTable)
    .values({
      ...parsed.data,
      status: "Đang hoạt động",
      enrolled: 0,
      progress: 0,
      accent: courseAccents[(parsed.data.title.length + parsed.data.lessons) % courseAccents.length]!,
      instructorName,
    })
    .returning();
  res.status(201).json(course);
});

router.patch("/lms/courses/:id", async (req, res): Promise<void> => {
  await ensureLmsSeeded();
  const params = UpdateLmsCourseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateLmsCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (typeof req.body.instructorName === "string") {
    updateData.instructorName = req.body.instructorName;
  }
  const [course] = await db
    .update(lmsCoursesTable)
    .set(updateData)
    .where(eq(lmsCoursesTable.id, params.data.id))
    .returning();
  if (!course) {
    res.status(404).json({ error: "Không tìm thấy khóa học." });
    return;
  }
  res.json(course);
});

router.get("/lms/learners", async (_req, res): Promise<void> => {
  await ensureLmsSeeded();
  const learners = await db
    .select()
    .from(lmsLearnersTable)
    .orderBy(desc(lmsLearnersTable.points));
  res.json(learners);
});

router.patch("/lms/learners/:id/role", async (req, res): Promise<void> => {
  await ensureLmsSeeded();
  const id = Number(req.params.id);
  const { role } = req.body;
  if (!["student", "lecturer", "admin"].includes(role)) {
    res.status(400).json({ error: "Vai trò không hợp lệ. Chọn: student, lecturer, admin." });
    return;
  }
  const [updated] = await db
    .update(lmsLearnersTable)
    .set({ role })
    .where(eq(lmsLearnersTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Không tìm thấy người dùng." });
    return;
  }
  await db.insert(lmsActivitiesTable).values({
    title: `Phân quyền người dùng: ${updated.name}`,
    detail: `Vai trò mới: ${role === "admin" ? "Quản trị viên" : role === "lecturer" ? "Giảng viên" : "Học viên"}`,
    time: "Vừa xong",
    kind: "enrollment",
  });
  res.json(updated);
});

router.get("/lms/learning-paths", async (_req, res): Promise<void> => {
  await ensureLmsSeeded();
  const paths = await db
    .select()
    .from(lmsLearningPathsTable)
    .orderBy(desc(lmsLearningPathsTable.learners));
  res.json(ListLmsLearningPathsResponse.parse(paths));
});

router.post("/lms/enrollments/auto-enroll", async (req, res): Promise<void> => {
  await ensureLmsSeeded();
  const parsed = AutoEnrollLearnersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { courseId, learnerIds } = parsed.data;
  const course = await db
    .select()
    .from(lmsCoursesTable)
    .where(eq(lmsCoursesTable.id, courseId))
    .limit(1);
  const learners = await db
    .select()
    .from(lmsLearnersTable)
    .where(inArray(lmsLearnersTable.id, learnerIds));
  if (!course[0] || learners.length !== new Set(learnerIds).size) {
    res.status(404).json({ error: "Không tìm thấy khóa học hoặc học viên." });
    return;
  }

  const result = await db.transaction(async (tx) => {
    const existing = await tx
      .select({ learnerId: lmsEnrollmentsTable.learnerId })
      .from(lmsEnrollmentsTable)
      .where(
        and(
          eq(lmsEnrollmentsTable.courseId, courseId),
          inArray(lmsEnrollmentsTable.learnerId, learnerIds),
        ),
      );
    const existingIds = new Set(existing.map((item) => item.learnerId));
    const newLearners = learners.filter(
      (learner) => !existingIds.has(learner.id),
    );
    if (newLearners.length > 0) {
      await tx.insert(lmsEnrollmentsTable).values(
        newLearners.map((learner) => ({
          learnerId: learner.id,
          courseId,
          status: "Đang học",
          completedLessonIds: [],
        })),
      );
      await tx
        .update(lmsCoursesTable)
        .set({
          enrolled: sql`${lmsCoursesTable.enrolled} + ${newLearners.length}`,
        })
        .where(eq(lmsCoursesTable.id, courseId));
      await tx
        .update(lmsLearnersTable)
        .set({ activeCourse: course[0]!.title })
        .where(inArray(lmsLearnersTable.id, newLearners.map((item) => item.id)));
      await tx.insert(lmsActivitiesTable).values({
        title: `${newLearners.length} học viên vừa được ghi danh`,
        detail: course[0]!.title,
        time: "Vừa xong",
        kind: "enrollment",
      });
    }
    return {
      enrolled: newLearners.length,
      skipped: learners.length - newLearners.length,
      message:
        newLearners.length > 0
          ? `Đã tự động ghi danh ${newLearners.length} học viên vào khóa học.`
          : "Tất cả học viên đã có trong khóa học này.",
    };
  });
  res.status(201).json(AutoEnrollLearnersResponse.parse(result));
});

router.get("/lms/certificates", async (_req, res): Promise<void> => {
  await ensureLmsSeeded();
  const certificates = await db
    .select()
    .from(lmsCertificatesTable)
    .orderBy(desc(lmsCertificatesTable.id));
  res.json(ListLmsCertificatesResponse.parse(certificates));
});

router.get("/lms/leaderboard", async (_req, res): Promise<void> => {
  await ensureLmsSeeded();
  const learners = await db
    .select()
    .from(lmsLearnersTable)
    .orderBy(desc(lmsLearnersTable.points));
  const badgeRows = await db
    .select({
      learnerId: lmsBadgesTable.learnerId,
      badgeCount: count(),
    })
    .from(lmsBadgesTable)
    .groupBy(lmsBadgesTable.learnerId);
  const badgeCounts = new Map(
    badgeRows.map((row) => [row.learnerId, Number(row.badgeCount)]),
  );
  const response = learners.map((learner, index) => ({
    id: learner.id,
    name: learner.name,
    team: learner.team,
    points: learner.points,
    streak: learner.streak,
    badges: badgeCounts.get(learner.id) ?? 0,
    rank: index + 1,
  }));
  res.json(GetLmsLeaderboardResponse.parse(response));
});

router.get("/lms/badges", async (_req, res): Promise<void> => {
  await ensureLmsSeeded();
  const rows = await db
    .select({
      id: lmsBadgesTable.id,
      learner: lmsLearnersTable.name,
      name: lmsBadgesTable.name,
      description: lmsBadgesTable.description,
      icon: lmsBadgesTable.icon,
      awardedAt: lmsBadgesTable.awardedAt,
    })
    .from(lmsBadgesTable)
    .innerJoin(lmsLearnersTable, eq(lmsBadgesTable.learnerId, lmsLearnersTable.id))
    .orderBy(desc(lmsBadgesTable.id));
  res.json(ListLmsBadgesResponse.parse(rows));
});

router.get("/lms/plugins", async (_req, res): Promise<void> => {
  const plugins = [
    {
      id: 1,
      name: "H5P Interactive",
      description: "Video tương tác, câu hỏi nhúng và hoạt động kéo thả.",
      standard: "H5P",
      status: "Đang bật",
      icon: "puzzle",
    },
    {
      id: 2,
      name: "SCORM Player",
      description: "Theo dõi tiến độ và điểm số của gói học SCORM.",
      standard: "SCORM 1.2",
      status: "Sẵn sàng",
      icon: "layers",
    },
    {
      id: 3,
      name: "xAPI Learning Record Store",
      description: "Ghi nhận hoạt động học tập theo chuẩn xAPI.",
      standard: "xAPI",
      status: "Đang bật",
      icon: "activity",
    },
  ];
  res.json(ListLmsPluginsResponse.parse(plugins));
});

router.post("/lms/progress/complete", async (req, res): Promise<void> => {
  await ensureLmsSeeded();
  const parsed = CompleteLmsLessonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { learnerId, courseId, lessonId, score } = parsed.data;
  const [course] = await db
    .select()
    .from(lmsCoursesTable)
    .where(eq(lmsCoursesTable.id, courseId))
    .limit(1);
  const [learner] = await db
    .select()
    .from(lmsLearnersTable)
    .where(eq(lmsLearnersTable.id, learnerId))
    .limit(1);
  if (!course || !learner) {
    res.status(404).json({ error: "Không tìm thấy khóa học hoặc học viên." });
    return;
  }
  if (score < 70) {
    res.status(400).json({ error: "Cần đạt ít nhất 70 điểm để hoàn thành bài học." });
    return;
  }

  const result = await db.transaction(async (tx) => {
    let [enrollment] = await tx
      .select()
      .from(lmsEnrollmentsTable)
      .where(
        and(
          eq(lmsEnrollmentsTable.learnerId, learnerId),
          eq(lmsEnrollmentsTable.courseId, courseId),
        ),
      )
      .limit(1);
    const isNewEnrollment = !enrollment;
    if (!enrollment) {
      [enrollment] = await tx
        .insert(lmsEnrollmentsTable)
        .values({
          learnerId,
          courseId,
          status: "Đang học",
          completedLessonIds: [],
        })
        .returning();
      await tx
        .update(lmsCoursesTable)
        .set({ enrolled: sql`${lmsCoursesTable.enrolled} + 1` })
        .where(eq(lmsCoursesTable.id, courseId));
    }
    const completedLessonIds = enrollment?.completedLessonIds ?? [];
    const isNewLesson = !completedLessonIds.includes(lessonId);
    const nextLessons = isNewLesson
      ? [...completedLessonIds, lessonId]
      : completedLessonIds;
    const progress = Math.min(
      100,
      Math.round((nextLessons.length / course.lessons) * 100),
    );
    const enrolledCount = Math.max(
      1,
      course.enrolled + (isNewEnrollment ? 1 : 0),
    );
    const courseProgress = Math.round(
      ((course.progress * (enrolledCount - 1)) + progress) / enrolledCount,
    );
    const certificateSerial = `NOVA-${new Date().getFullYear()}-${String(courseId).padStart(3, "0")}-${String(learnerId).padStart(4, "0")}`;
    let certificateIssued = false;

    if (enrollment) {
      await tx
        .update(lmsEnrollmentsTable)
        .set({
          completedLessonIds: nextLessons,
          status: progress === 100 ? "Hoàn thành" : "Đang học",
        })
        .where(eq(lmsEnrollmentsTable.id, enrollment.id));
    }
    await tx
      .update(lmsLearnersTable)
      .set({
        progress: Math.max(learner.progress, progress),
        activeCourse: course.title,
        ...(isNewLesson ? { points: sql`${lmsLearnersTable.points} + ${Math.max(10, Math.round(score * 1.5))}` } : {}),
      })
      .where(eq(lmsLearnersTable.id, learnerId));
    await tx
      .update(lmsCoursesTable)
      .set({ progress: courseProgress })
      .where(eq(lmsCoursesTable.id, courseId));

    if (isNewLesson && score >= 90) {
      await tx
        .insert(lmsBadgesTable)
        .values({
          learnerId,
          name: "Chinh phục thử thách",
          description: "Đạt từ 90 điểm trong bài học tương tác.",
          icon: "award",
          awardedAt: new Date().toISOString().slice(0, 10),
        })
        .onConflictDoNothing();
    }
    if (progress === 100) {
      await tx
        .insert(lmsBadgesTable)
        .values({
          learnerId,
          name: `Hoàn thành ${course.title}`,
          description: `Hoàn thành tất cả bài học trong ${course.title}.`,
          icon: "graduation-cap",
          awardedAt: new Date().toISOString().slice(0, 10),
        })
        .onConflictDoNothing();
      const [certificate] = await tx
        .insert(lmsCertificatesTable)
        .values({
          learner: learner.name,
          course: course.title,
          serial: certificateSerial,
          issuedAt: new Date().toISOString().slice(0, 10),
          status: "Đã cấp",
        })
        .onConflictDoNothing()
        .returning();
      certificateIssued = Boolean(certificate);
    }
    if (isNewLesson) {
      await tx.insert(lmsActivitiesTable).values({
        title: `${learner.name} vừa hoàn thành bài học`,
        detail: `${course.title} · ${score} điểm`,
        time: "Vừa xong",
        kind: "completion",
      });
    }
    if (certificateIssued) {
      await tx.insert(lmsActivitiesTable).values({
        title: "Chứng chỉ được cấp tự động",
        detail: `${learner.name} · ${course.title}`,
        time: "Vừa xong",
        kind: "certificate",
      });
    }
    return {
      progress,
      certificateIssued,
      pointsAwarded: isNewLesson ? Math.max(10, Math.round(score * 1.5)) : 0,
    };
  });
  res.json(CompleteLmsLessonResponse.parse(result));
});

router.post("/lms/xapi/events", async (req, res): Promise<void> => {
  await ensureLmsSeeded();
  const parsed = RecordXapiEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const learner = await db
    .select({ id: lmsLearnersTable.id })
    .from(lmsLearnersTable)
    .where(eq(lmsLearnersTable.id, parsed.data.learnerId))
    .limit(1);
  if (!learner[0]) {
    res.status(404).json({ error: "Không tìm thấy học viên." });
    return;
  }
  const timestamp = new Date().toISOString();
  const [event] = await db
    .insert(lmsXapiEventsTable)
    .values({ ...parsed.data, timestamp })
    .returning();
  await db.insert(lmsActivitiesTable).values({
    title: `Đã ghi nhận sự kiện xAPI: ${parsed.data.verb}`,
    detail: parsed.data.objectId,
    time: "Vừa xong",
    kind: "quiz",
  });
  res.status(201).json(RecordXapiEventResponse.parse(event));
});

export default router;
