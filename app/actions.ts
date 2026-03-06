"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/repositories/reading-repository";

export async function selectPlanAction(formData: FormData) {
  const planId = String(formData.get("planId"));
  if (!planId) return;

  const user = await getDemoUser();

  await prisma.userPlanEnrollment.upsert({
    where: {
      userId_planId: {
        userId: user.id,
        planId
      }
    },
    update: {
      completed: false
    },
    create: {
      userId: user.id,
      planId,
      currentDay: 1
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");
}

export async function completeCurrentDayAction(formData: FormData) {
  const enrollmentId = String(formData.get("enrollmentId"));
  const dayNumber = Number(formData.get("dayNumber"));

  if (!enrollmentId || Number.isNaN(dayNumber)) return;

  await prisma.$transaction(async (tx) => {
    await tx.userProgressDay.upsert({
      where: {
        enrollmentId_dayNumber: {
          enrollmentId,
          dayNumber
        }
      },
      update: {},
      create: {
        enrollmentId,
        dayNumber
      }
    });

    const enrollment = await tx.userPlanEnrollment.findUniqueOrThrow({
      where: { id: enrollmentId },
      include: { plan: true }
    });

    const nextDay = dayNumber + 1;
    const isCompleted = nextDay > enrollment.plan.duration;

    await tx.userPlanEnrollment.update({
      where: { id: enrollmentId },
      data: {
        currentDay: isCompleted ? enrollment.plan.duration : nextDay,
        completed: isCompleted
      }
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");
}
