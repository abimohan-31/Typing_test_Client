import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// A dictionary of 200 common English words for typing practice
const wordBank = {
  easy: [
    "the",
    "be",
    "to",
    "of",
    "and",
    "a",
    "in",
    "that",
    "have",
    "it",
    "for",
    "not",
    "on",
    "with",
    "he",
    "as",
    "you",
    "do",
    "at",
    "this",
    "but",
    "his",
    "by",
    "from",
    "they",
    "we",
    "say",
    "her",
    "she",
    "or",
    "an",
    "will",
    "my",
    "one",
    "all",
    "up",
    "out",
    "if",
    "who",
    "get",
    "go",
    "me",
    "when",
    "can",
    "like",
    "time",
    "no",
    "just",
    "him",
    "know",
    "take",
    "into",
    "year",
    "your",
    "good",
    "some",
    "see",
    "them",
  ],
  medium: [
    "people",
    "would",
    "there",
    "their",
    "what",
    "about",
    "which",
    "make",
    "could",
    "other",
    "think",
    "also",
    "back",
    "after",
    "use",
    "two",
    "how",
    "our",
    "work",
    "first",
    "well",
    "way",
    "even",
    "new",
    "want",
    "because",
    "any",
    "these",
    "give",
    "day",
    "most",
    "us",
    "different",
  ],
  hard: [
    "government",
    "experience",
    "everything",
    "technology",
    "information",
    "community",
    "development",
    "understand",
    "available",
    "including",
    "especially",
    "themselves",
    "everything",
    "relationship",
    "communication",
    "environment",
    "traditional",
    "performance",
    "opportunity",
    "professional",
    "management",
    "description",
    "international",
    "organization",
    "significant",
  ],
};

/**
 * Generate random text for a typing test based on duration
 * Assumes average typing speed of 60 WPM, which is 1 word per second.
 * Adds a buffer to ensure they don't run out of words.
 * @param durationMinutes The duration of the test in minutes
 * @returns object An object containing text and metadata
 */
export function generatePracticeText(durationMinutes: number) {
  // 60 WPM * duration + 30% buffer
  const wordCount = Math.ceil(60 * durationMinutes * 1.3);
  let textArray = [];

  const sourcePool =
    durationMinutes >= 5
      ? [...wordBank.easy, ...wordBank.medium, ...wordBank.hard]
      : durationMinutes >= 3
        ? [...wordBank.easy, ...wordBank.medium]
        : wordBank.easy;

  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * sourcePool.length);
    textArray.push(sourcePool[randomIndex]);
  }
  const text = textArray.join(" ");

  // Determine difficulty based on duration
  let difficulty: "Easy" | "Medium" | "Hard" = "Easy";
  if (durationMinutes >= 3) difficulty = "Medium";
  if (durationMinutes >= 5) difficulty = "Hard";

  return {
    text,
    wordCount: textArray.length,
    characterCount: text.length,
    difficulty,
  };
}
