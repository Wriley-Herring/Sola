import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@sola.app";

export async function getDemoUser() {
  return prisma.user.findUniqueOrThrow({ where: { email: DEMO_EMAIL } });
}

export async function getReadingPlans() {
  return prisma.readingPlan.findMany({
    orderBy: { createdAt: "asc" }
  });
}

export async function getEnrollmentWithPlan() {
  const user = await getDemoUser();
  return prisma.userPlanEnrollment.findFirst({
    where: { userId: user.id, completed: false },
    include: {
      plan: true,
      completedDays: true
    },
    orderBy: { startedAt: "desc" }
  });
}

export async function getCurrentReadingDay(enrollmentId: string, planId: string, dayNumber: number) {
  const day = await prisma.readingPlanDay.findUnique({
    where: {
      planId_dayNumber: { planId, dayNumber }
    }
  });

  if (!day) {
    await prisma.userPlanEnrollment.update({
      where: { id: enrollmentId },
      data: { completed: true }
    });
    return null;
  }

  return day;
}
