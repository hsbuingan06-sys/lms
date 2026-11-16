import { eq } from "drizzle-orm";
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

const courseSeed = [
  {
    title: "Hội nhập cùng Nova",
    description:
      "Hành trình làm quen với văn hóa, con người và cách làm việc tại Nova.",
    category: "Hội nhập",
    level: "Cơ bản",
    duration: "2 giờ 30 phút",
    lessons: 6,
    enrolled: 128,
    progress: 72,
    status: "Đang hoạt động",
    format: "H5P",
    accent: "teal",
  },
  {
    title: "Lãnh đạo đội ngũ linh hoạt",
    description:
      "Xây dựng đội ngũ chủ động bằng phản hồi rõ ràng và tin cậy.",
    category: "Kỹ năng lãnh đạo",
    level: "Nâng cao",
    duration: "4 giờ",
    lessons: 8,
    enrolled: 86,
    progress: 54,
    status: "Đang hoạt động",
    format: "SCORM 1.2",
    accent: "violet",
  },
  {
    title: "Bảo mật thông tin thực hành",
    description:
      "Nhận diện rủi ro thường gặp và xử lý an toàn trong công việc hằng ngày.",
    category: "Tuân thủ",
    level: "Cơ bản",
    duration: "1 giờ 45 phút",
    lessons: 5,
    enrolled: 214,
    progress: 89,
    status: "Đang hoạt động",
    format: "xAPI",
    accent: "amber",
  },
];

const learnerSeed = [
  {
    name: "Minh Anh",
    email: "minh.anh@nova.vn",
    team: "Sản phẩm",
    points: 1840,
    streak: 12,
    progress: 82,
    activeCourse: "Hội nhập cùng Nova",
    lastActive: "Hôm nay, 09:42",
  },
  {
    name: "Quang Huy",
    email: "quang.huy@nova.vn",
    team: "Kinh doanh",
    points: 1620,
    streak: 8,
    progress: 76,
    activeCourse: "Lãnh đạo đội ngũ linh hoạt",
    lastActive: "Hôm nay, 08:15",
  },
  {
    name: "Thu Hà",
    email: "thu.ha@nova.vn",
    team: "Nhân sự",
    points: 1480,
    streak: 16,
    progress: 91,
    activeCourse: "Bảo mật thông tin thực hành",
    lastActive: "Hôm qua, 16:30",
  },
  {
    name: "Đức Thành",
    email: "duc.thanh@nova.vn",
    team: "Công nghệ",
    points: 1260,
    streak: 5,
    progress: 64,
    activeCourse: "Hội nhập cùng Nova",
    lastActive: "Hôm qua, 14:08",
  },
  {
    name: "Lan Phương",
    email: "lan.phuong@nova.vn",
    team: "Thiết kế",
    points: 980,
    streak: 3,
    progress: 48,
    activeCourse: "Bảo mật thông tin thực hành",
    lastActive: "Thứ Hai, 11:24",
  },
];

const pathCourseSequences: Record<string, string[]> = {
  "Khởi đầu vững vàng": [
    "Hội nhập cùng Nova",
    "Bảo mật thông tin thực hành",
  ],
  "Từ chuyên viên đến quản lý": [
    "Bảo mật thông tin thực hành",
    "Hội nhập cùng Nova",
    "Lãnh đạo đội ngũ linh hoạt",
  ],
  "An toàn trong từng thao tác": ["Bảo mật thông tin thực hành"],
};

async function ensureXapiSampleEvents(
  learners: Array<{ id: number }>,
): Promise<void> {
  const existingEvents = await db
    .select({ id: lmsXapiEventsTable.id })
    .from(lmsXapiEventsTable)
    .limit(1);
  if (existingEvents.length > 0 || learners.length === 0) return;

  const xapiSeeds = Array.from({ length: 14 }, (_, index) => {
    const learnerId = learners[index % learners.length]!.id;
    const daysAgo = 6 - Math.floor(index / 2);
    const score = 72 + ((index * 7) % 29);
    const verb =
      index % 3 === 0
        ? "http://adlnet.gov/expapi/verbs/completed"
        : "http://adlnet.gov/expapi/verbs/experienced";
    return {
      learnerId,
      verb,
      objectId: `https://lms.nova.vn/activities/lesson-${index + 1}`,
      score,
      timestamp: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
      raw: {
        actor: { learnerId },
        verb: index % 3 === 0 ? "completed" : "experienced",
        object: `lesson-${index + 1}`,
        result: { score: { raw: score, min: 0, max: 100 } },
      },
    };
  });
  await db.insert(lmsXapiEventsTable).values(xapiSeeds);
}

let seedPromise: Promise<void> | undefined;

async function seedLmsData(): Promise<void> {
  const existing = await db
    .select({ id: lmsCoursesTable.id })
    .from(lmsCoursesTable)
    .limit(1);
  if (existing.length > 0) {
    const learners = await db
      .select({ id: lmsLearnersTable.id })
      .from(lmsLearnersTable);
    await ensureXapiSampleEvents(learners);
    const paths = await db.select().from(lmsLearningPathsTable);
    for (const path of paths) {
      const courseTitles = pathCourseSequences[path.title];
      if (courseTitles && path.courseTitles.length === 0) {
        await db
          .update(lmsLearningPathsTable)
          .set({ courseTitles, courses: courseTitles.length })
          .where(eq(lmsLearningPathsTable.id, path.id));
      }
    }
    return;
  }

  await db.insert(lmsCoursesTable).values(courseSeed);
  await db.insert(lmsLearnersTable).values(learnerSeed);
  await db.insert(lmsLearningPathsTable).values([
    {
      title: "Khởi đầu vững vàng",
      description: "Lộ trình hội nhập dành cho thành viên mới trong 30 ngày.",
      courses: 2,
      courseTitles: [
        "Hội nhập cùng Nova",
        "Bảo mật thông tin thực hành",
      ],
      duration: "6 giờ",
      completion: 78,
      learners: 42,
      accent: "teal",
    },
    {
      title: "Từ chuyên viên đến quản lý",
      description: "Phát triển năng lực dẫn dắt, giao việc và khai vấn đội ngũ.",
      courses: 3,
      courseTitles: [
        "Bảo mật thông tin thực hành",
        "Hội nhập cùng Nova",
        "Lãnh đạo đội ngũ linh hoạt",
      ],
      duration: "12 giờ",
      completion: 46,
      learners: 28,
      accent: "violet",
    },
    {
      title: "An toàn trong từng thao tác",
      description: "Các kiến thức tuân thủ cần thiết cho mọi phòng ban.",
      courses: 1,
      courseTitles: ["Bảo mật thông tin thực hành"],
      duration: "5 giờ",
      completion: 91,
      learners: 116,
      accent: "amber",
    },
  ]);

  const courses = await db.select().from(lmsCoursesTable);
  const learners = await db.select().from(lmsLearnersTable);
  const courseIds = new Map(courses.map((course) => [course.title, course.id]));
  const learnerIds = new Map(learners.map((learner) => [learner.email, learner.id]));

  const onboardingId = courseIds.get("Hội nhập cùng Nova");
  const leadershipId = courseIds.get("Lãnh đạo đội ngũ linh hoạt");
  const securityId = courseIds.get("Bảo mật thông tin thực hành");
  const minhAnhId = learnerIds.get("minh.anh@nova.vn");
  const quangHuyId = learnerIds.get("quang.huy@nova.vn");
  const thuHaId = learnerIds.get("thu.ha@nova.vn");
  const ducThanhId = learnerIds.get("duc.thanh@nova.vn");

  if (
    onboardingId !== undefined &&
    leadershipId !== undefined &&
    securityId !== undefined &&
    minhAnhId !== undefined &&
    quangHuyId !== undefined &&
    thuHaId !== undefined &&
    ducThanhId !== undefined
  ) {
    await db.insert(lmsEnrollmentsTable).values([
      { learnerId: minhAnhId, courseId: onboardingId, completedLessonIds: ["intro", "culture"] },
      { learnerId: quangHuyId, courseId: leadershipId, completedLessonIds: ["lead-1", "lead-2"] },
      { learnerId: thuHaId, courseId: securityId, completedLessonIds: ["secure-1", "secure-2", "secure-3", "secure-4"] },
      { learnerId: ducThanhId, courseId: onboardingId, completedLessonIds: ["intro"] },
    ]);
  }

  await ensureXapiSampleEvents(learners);

  await db.insert(lmsCertificatesTable).values([
    {
      learner: "Thu Hà",
      course: "Quy tắc ứng xử nơi làm việc",
      serial: "NOVA-2026-00124",
      issuedAt: "2026-10-28",
      status: "Đã cấp",
    },
    {
      learner: "Minh Anh",
      course: "Tư duy lấy khách hàng làm trọng tâm",
      serial: "NOVA-2026-00123",
      issuedAt: "2026-10-27",
      status: "Đã cấp",
    },
    {
      learner: "Quang Huy",
      course: "An toàn thông tin cơ bản",
      serial: "NOVA-2026-00122",
      issuedAt: "2026-10-24",
      status: "Đã cấp",
    },
  ]);

  if (
    minhAnhId !== undefined &&
    quangHuyId !== undefined &&
    thuHaId !== undefined &&
    ducThanhId !== undefined
  ) {
    await db.insert(lmsBadgesTable).values([
      {
        learnerId: minhAnhId,
        name: "Bứt phá tuần đầu",
        description: "Hoàn thành 5 bài học đầu tiên.",
        icon: "sparkles",
        awardedAt: "2026-11-02",
      },
      {
        learnerId: minhAnhId,
        name: "Người học bền bỉ",
        description: "Duy trì chuỗi học tập 7 ngày.",
        icon: "flame",
        awardedAt: "2026-11-05",
      },
      {
        learnerId: quangHuyId,
        name: "Tư duy dẫn dắt",
        description: "Hoàn thành lộ trình quản lý.",
        icon: "compass",
        awardedAt: "2026-10-29",
      },
      {
        learnerId: thuHaId,
        name: "Chuyên gia an toàn",
        description: "Đạt điểm tối đa trong bài kiểm tra tuân thủ.",
        icon: "shield",
        awardedAt: "2026-10-26",
      },
      {
        learnerId: ducThanhId,
        name: "Người học chủ động",
        description: "Bắt đầu lộ trình học đầu tiên.",
        icon: "rocket",
        awardedAt: "2026-10-21",
      },
    ]);
  }

  await db.insert(lmsActivitiesTable).values([
    {
      title: "Thu Hà vừa hoàn thành khóa học",
      detail: "Quy tắc ứng xử nơi làm việc · Chứng chỉ đã cấp",
      time: "12 phút trước",
      kind: "certificate",
    },
    {
      title: "18 học viên mới được ghi danh",
      detail: "Lộ trình Khởi đầu vững vàng",
      time: "1 giờ trước",
      kind: "enrollment",
    },
    {
      title: "Minh Anh đạt huy hiệu mới",
      detail: "Bứt phá tuần đầu · 120 điểm",
      time: "3 giờ trước",
      kind: "completion",
    },
    {
      title: "Bài kiểm tra vừa được cập nhật",
      detail: "Bảo mật thông tin thực hành · H5P",
      time: "Hôm qua",
      kind: "quiz",
    },
  ]);
}

export function ensureLmsSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seedLmsData().catch((error: unknown) => {
      seedPromise = undefined;
      throw error;
    });
  }
  return seedPromise;
}
