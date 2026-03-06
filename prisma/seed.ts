import { PrismaClient } from "@prisma/client";
import { seedPlans } from "../db/seed-data";

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@sola.app" },
    update: {},
    create: {
      email: "demo@sola.app",
      name: "Sola Reader"
    }
  });

  for (const plan of seedPlans) {
    const createdPlan = await prisma.readingPlan.upsert({
      where: { slug: plan.slug },
      update: {
        title: plan.title,
        description: plan.description,
        duration: plan.duration
      },
      create: {
        slug: plan.slug,
        title: plan.title,
        description: plan.description,
        duration: plan.duration
      }
    });

    for (const day of plan.days) {
      await prisma.readingPlanDay.upsert({
        where: {
          planId_dayNumber: {
            planId: createdPlan.id,
            dayNumber: day.dayNumber
          }
        },
        update: {
          passageReference: day.passageReference,
          normalizedRef: day.passageReference.toLowerCase(),
          passageText: day.passageText
        },
        create: {
          planId: createdPlan.id,
          dayNumber: day.dayNumber,
          passageReference: day.passageReference,
          normalizedRef: day.passageReference.toLowerCase(),
          passageText: day.passageText
        }
      });
    }
  }

  await prisma.userPlanEnrollment.upsert({
    where: {
      userId_planId: {
        userId: demoUser.id,
        planId: (await prisma.readingPlan.findFirstOrThrow({ where: { slug: "life-of-jesus" } })).id
      }
    },
    update: {},
    create: {
      userId: demoUser.id,
      planId: (await prisma.readingPlan.findFirstOrThrow({ where: { slug: "life-of-jesus" } })).id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
