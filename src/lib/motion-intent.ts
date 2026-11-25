const ACTION_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(danc(?:e|es|ed|ing))\b/i, label: "dance" },
  { pattern: /\b(walk(?:s|ed|ing)?)\b/i, label: "walk" },
  { pattern: /\b(run(?:s|ning)?|ran)\b/i, label: "run" },
  { pattern: /\b(jump(?:s|ed|ing)?|leap(?:s|ed|ing)?)\b/i, label: "jump" },
  { pattern: /\b(gallop(?:s|ed|ing)?)\b/i, label: "gallop" },
  { pattern: /\b(trot(?:s|ted|ting)?)\b/i, label: "trot" },
  { pattern: /\b(swim(?:s|ming)?|swam)\b/i, label: "swim" },
  { pattern: /\b(fly(?:ing)?|flies|flew)\b/i, label: "fly" },
  { pattern: /\b(stomp(?:s|ed|ing)?)\b/i, label: "stomp" },
  { pattern: /\b(kick(?:s|ed|ing)?)\b/i, label: "kick" },
  { pattern: /\b(wav(?:e|es|ed|ing))\b/i, label: "wave" },
  { pattern: /\b(nod(?:s|ded|ding)?)\b/i, label: "nod" },
  { pattern: /\b(sit(?:s|ting)?|sat)\b/i, label: "sit" },
  { pattern: /\b(eat(?:s|ing)?|ate)\b/i, label: "eat" },
  { pattern: /\b(fight(?:s|ing)?|fought)\b/i, label: "fight" },
  { pattern: /\b(hug(?:s|ged|ging)?)\b/i, label: "hug" },
];

/**
 * Detects a prompt that asks the subject itself to perform a body action.
 *
 * The procedural renderer only moves the camera and particles; it never
 * animates the subject. Callers use this to state that plainly instead of
 * implying the subject will perform the requested action.
 *
 * This is a plain keyword scan, not language understanding, so it can be
 * wrong on unusual phrasing. It only ever adds a disclosure, never a claim.
 */
export function detectCharacterAction(prompt: string): string | null {
  const text = prompt.toLowerCase();
  for (const { pattern, label } of ACTION_PATTERNS) {
    if (pattern.test(text)) return label;
  }
  return null;
}
