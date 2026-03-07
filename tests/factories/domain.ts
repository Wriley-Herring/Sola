export const makeUser = (overrides: Partial<{ id: string; email: string }> = {}) => ({
  id: "user-1",
  email: "user-1@example.com",
  ...overrides
});

export const makePlan = (overrides: Partial<{ id: string; slug: string; title: string; description: string; duration: number }> = {}) => ({
  id: "plan-1",
  slug: "gospel-of-mark",
  title: "Gospel of Mark",
  description: "30 day reading plan",
  duration: 30,
  ...overrides
});

export const makePlanDay = (overrides: Partial<{ id: string; day_number: number; passage_reference: string; passage_text: string }> = {}) => ({
  id: "day-1",
  day_number: 1,
  passage_reference: "Mark 1:1-8",
  passage_text: "The beginning of the good news...",
  ...overrides
});

export const makeProgress = (overrides: Partial<{ id: string; user_id: string; reading_plan_id: string; current_day: number; completed_days: number[] }> = {}) => ({
  id: "progress-1",
  user_id: "user-1",
  reading_plan_id: "plan-1",
  current_day: 1,
  completed_days: [] as number[],
  ...overrides
});

export const makeInsightCacheRow = (overrides: Partial<{ historical_context: string; cultural_context: string; literary_context: string; key_themes: string[]; reflection_question: string }> = {}) => ({
  historical_context: "Historical context",
  cultural_context: "Cultural context",
  literary_context: "Literary context",
  key_themes: ["Theme 1", "Theme 2", "Theme 3"],
  reflection_question: "What does this reveal about God?",
  ...overrides
});

export const makeAiResponse = (overrides: Partial<{ historicalContext: string; culturalContext: string; literaryContext: string; keyThemes: string[]; reflectionQuestion: string }> = {}) => ({
  historicalContext: "Historical context",
  culturalContext: "Cultural context",
  literaryContext: "Literary context",
  keyThemes: ["Theme 1", "Theme 2", "Theme 3"],
  reflectionQuestion: "How will I respond today?",
  ...overrides
});
