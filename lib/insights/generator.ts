import type { PassageInsights } from "@/types/insights";

const fallbackInsight = (reference: string): PassageInsights => ({
  historicalContext:
    "This passage sits inside God's unfolding covenant story, inviting readers to trust that His character remains consistent across every season.",
  culturalContext:
    "The text emerges from a communal, honor-shaped world where identity, family, and faith were deeply intertwined with everyday life.",
  literaryContext:
    "Read this section slowly within its chapter flow; notice repeated words, movement, and how the central action reveals God's heart.",
  keyThemes: ["Faithful Presence", "Mercy", "Trust", "Kingdom Imagination"],
  reflectionQuestion: `What would it look like to embody the invitation of ${reference} in one practical decision today?`
});

const library: Record<string, PassageInsights> = {
  "luke 10:25-37": {
    historicalContext:
      "Jesus tells this parable in a charged public exchange. Religious leaders were debating the boundaries of obedience, and Jesus redirects the conversation from rule precision to embodied mercy.",
    culturalContext:
      "Samaritans and Jews carried generations of mutual distrust. Making a Samaritan the compassionate hero would have startled listeners and confronted social prejudice directly.",
    literaryContext:
      "The story is framed by two questions: 'What must I do?' and 'Who is my neighbor?' Jesus answers by shifting from defining neighbor to becoming one through action.",
    keyThemes: ["Neighbor Love", "Boundary-Crossing Mercy", "Embodied Faith", "Compassion as Obedience"],
    reflectionQuestion: "Who is easy for you to overlook right now, and what would costly mercy look like toward them this week?"
  },
  "psalm 23:1-6": {
    historicalContext:
      "David's shepherd imagery reflects real agrarian life in ancient Israel where shepherds guarded, guided, and provided for vulnerable flocks.",
    culturalContext:
      "In the ancient Near East, kings often described themselves as shepherds of their people. Calling the Lord shepherd places ultimate trust in God's personal care over human power.",
    literaryContext:
      "The psalm moves from provision, to protection in shadowed valleys, to table fellowship. The progression reveals trust that is not fragile but matured through trial.",
    keyThemes: ["Divine Care", "Fearless Trust", "Presence in Suffering", "Restored Soul"],
    reflectionQuestion: "Where do you need to exchange self-protection for trust in the Shepherd's care today?"
  },
  "genesis 1:1-5": {
    historicalContext:
      "Genesis opens amid surrounding cultures with competing creation myths. This account boldly presents one sovereign God who creates by word, not conflict.",
    culturalContext:
      "Ancient listeners would hear this as a reordering of reality: sun, moon, and sea are not gods to fear but created realities under God's authority.",
    literaryContext:
      "The rhythm of speaking, forming, and naming establishes order and purpose. Light arriving before luminaries emphasizes that God is the source of life and meaning.",
    keyThemes: ["God's Sovereignty", "Order from Chaos", "Sacred Beginnings", "Purposeful Creation"],
    reflectionQuestion: "What part of your life feels formless, and how might inviting God's voice bring order there?"
  }
};

export async function generatePassageInsights(reference: string, _passageText: string): Promise<PassageInsights> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const normalized = reference.trim().toLowerCase();
  return library[normalized] ?? fallbackInsight(reference);
}
