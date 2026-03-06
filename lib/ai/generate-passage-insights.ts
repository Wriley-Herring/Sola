import "server-only";

import OpenAI from "openai";

export type PassageInsights = {
  historicalContext: string;
  culturalContext: string;
  literaryContext: string;
  keyThemes: string[];
  reflectionQuestion: string;
};

const MODEL = "gpt-5-mini";
const PROMPT_VERSION = "v1";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "historicalContext",
    "culturalContext",
    "literaryContext",
    "keyThemes",
    "reflectionQuestion"
  ],
  properties: {
    historicalContext: { type: "string" },
    culturalContext: { type: "string" },
    literaryContext: { type: "string" },
    keyThemes: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" }
    },
    reflectionQuestion: { type: "string" }
  }
} as const;

function trimAndValidateString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new Error(`Invalid insight payload: ${fieldName} must be a string.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Invalid insight payload: ${fieldName} must be non-empty.`);
  }

  return trimmed;
}

function validateInsights(payload: unknown): PassageInsights {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid insight payload: expected an object.");
  }

  const record = payload as Record<string, unknown>;

  const historicalContext = trimAndValidateString(record.historicalContext, "historicalContext");
  const culturalContext = trimAndValidateString(record.culturalContext, "culturalContext");
  const literaryContext = trimAndValidateString(record.literaryContext, "literaryContext");
  const reflectionQuestion = trimAndValidateString(record.reflectionQuestion, "reflectionQuestion");

  const keyThemesValue = record.keyThemes;
  if (!Array.isArray(keyThemesValue)) {
    throw new Error("Invalid insight payload: keyThemes must be an array.");
  }

  const keyThemes = keyThemesValue
    .map((theme, index) => trimAndValidateString(theme, `keyThemes[${index}]`))
    .filter(Boolean);

  if (keyThemes.length < 3 || keyThemes.length > 5) {
    throw new Error("Invalid insight payload: keyThemes length must be between 3 and 5.");
  }

  return {
    historicalContext,
    culturalContext,
    literaryContext,
    keyThemes,
    reflectionQuestion
  };
}

export async function generatePassageInsights(reference: string, passageText: string): Promise<PassageInsights> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  const response = await client.responses.create({
    model: MODEL,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: [
              "You are a careful Bible study explainer for thoughtful everyday Christians.",
              "Tone: clear, humble, historically careful, concise, not preachy, not overly academic.",
              "Do not speculate beyond widely accepted historical understanding.",
              "Do not present debated interpretations as settled facts.",
              "Avoid denominational bias unless essential.",
              "Write clearly for non-experts.",
              "Avoid theological jargon unless explained.",
              "Do not output markdown.",
              "Output ONLY valid JSON.",
              "Length rules:",
              "- historicalContext: 60-120 words",
              "- culturalContext: 60-120 words",
              "- literaryContext: 60-120 words",
              "- keyThemes: 3-5 items",
              "- reflectionQuestion: exactly one question"
            ].join("\n")
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Reference: ${reference.trim()}\n\nPassage:\n${passageText.trim()}\n\nPrompt version: ${PROMPT_VERSION}`
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "passage_insights",
        schema,
        strict: true
      }
    }
  });

  const outputText = response.output_text;
  if (!outputText) {
    throw new Error("OpenAI returned empty output for passage insights.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(outputText);
  } catch {
    throw new Error("OpenAI returned invalid JSON for passage insights.");
  }

  return validateInsights(parsed);
}
