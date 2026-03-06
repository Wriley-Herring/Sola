export type SeedPlanDay = {
  dayNumber: number;
  passageReference: string;
  passageText: string;
};

export type SeedPlan = {
  slug: string;
  title: string;
  description: string;
  duration: number;
  days: SeedPlanDay[];
};

const shortPassage = (title: string, body: string) => `${title}\n\n${body}`;

const repeatToDuration = (days: Omit<SeedPlanDay, "dayNumber">[], duration: number): SeedPlanDay[] =>
  Array.from({ length: duration }, (_, index) => {
    const base = days[index % days.length];
    return {
      ...base,
      dayNumber: index + 1
    };
  });

export const seedPlans: SeedPlan[] = [
  {
    slug: "life-of-jesus",
    title: "Life of Jesus",
    description: "Walk through key moments in Christ's ministry with contemplative daily readings.",
    duration: 30,
    days: repeatToDuration(
      [
        {
          passageReference: "Luke 1:26-38",
          passageText: shortPassage(
            "The Angel Visits Mary",
            "In the sixth month, the angel Gabriel was sent from God to a city of Galilee named Nazareth... Mary said, 'Let it be to me according to your word.'"
          )
        },
        {
          passageReference: "Luke 2:1-20",
          passageText: shortPassage(
            "The Birth of Jesus",
            "And she gave birth to her firstborn son and wrapped him in swaddling cloths... 'Glory to God in the highest, and on earth peace among those with whom he is pleased!'"
          )
        },
        {
          passageReference: "Luke 10:25-37",
          passageText: shortPassage(
            "The Good Samaritan",
            "A lawyer stood up to test Jesus... 'Which of these three was a neighbor?' He said, 'The one who showed him mercy.' Jesus said, 'You go, and do likewise.'"
          )
        }
      ],
      30
    )
  },
  {
    slug: "foundations-of-scripture",
    title: "Foundations of Scripture",
    description: "A 30-day framework of core biblical passages that shape the story of redemption.",
    duration: 30,
    days: repeatToDuration(
      [
        {
          passageReference: "Genesis 1:1-5",
          passageText: shortPassage(
            "In the Beginning",
            "In the beginning, God created the heavens and the earth... And there was evening and there was morning, the first day."
          )
        },
        {
          passageReference: "Psalm 19:1-6",
          passageText: shortPassage(
            "The Heavens Declare",
            "The heavens declare the glory of God, and the sky above proclaims his handiwork... their voice goes out through all the earth."
          )
        },
        {
          passageReference: "Luke 10:25-37",
          passageText: shortPassage(
            "Neighbor Love",
            "Jesus answered with a story about mercy crossing boundaries and compassion interrupting convenience."
          )
        }
      ],
      30
    )
  },
  {
    slug: "psalms-for-prayer",
    title: "Psalms for Prayer",
    description: "Two weeks of honest prayer language for quiet reflection and trust.",
    duration: 14,
    days: repeatToDuration(
      [
        {
          passageReference: "Psalm 23:1-6",
          passageText: shortPassage(
            "The Lord Is My Shepherd",
            "The Lord is my shepherd; I shall not want... Surely goodness and mercy shall follow me all the days of my life."
          )
        },
        {
          passageReference: "Psalm 27:1-4",
          passageText: shortPassage(
            "One Thing I Ask",
            "The Lord is my light and my salvation; whom shall I fear?... to gaze upon the beauty of the Lord."
          )
        },
        {
          passageReference: "Psalm 42:1-5",
          passageText: shortPassage(
            "As the Deer",
            "As a deer pants for flowing streams, so pants my soul for you, O God... Hope in God; for I shall again praise him."
          )
        }
      ],
      14
    )
  }
];
