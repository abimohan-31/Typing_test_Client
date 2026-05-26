import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// A dictionary of 200 common English words for typing practice
const commonWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "is", "are", "was", "were", "been", "has", "had", "does", "did", "doing",
  "am", "doing", "must", "shall", "should", "may", "might", "can", "could", "ought",
  "word", "water", "through", "where", "much", "before", "line", "right", "too", "mean",
  "old", "any", "same", "tell", "boy", "follow", "came", "want", "show", "also",
  "around", "form", "three", "small", "set", "put", "end", "does", "another", "well",
  "large", "must", "big", "even", "such", "because", "turn", "here", "why", "ask",
  "went", "men", "read", "need", "land", "different", "home", "us", "move", "try",
  "kind", "hand", "picture", "again", "change", "off", "play", "spell", "air", "away",
  "animal", "house", "point", "page", "letter", "mother", "answer", "found", "study", "still",
  "learn", "should", "America", "world"
];

/**
 * Generate random text for a typing test based on duration
 * Assumes average typing speed of 60 WPM, which is 1 word per second.
 * Adds a buffer to ensure they don't run out of words.
 * @param durationMinutes The duration of the test in minutes
 * @returns string The generated practice text
 */
export function generatePracticeText(durationMinutes: number): string {
  // 60 WPM * duration + 30% buffer
  const wordCount = Math.ceil((60 * durationMinutes) * 1.3);
  let textArray = [];
  
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * commonWords.length);
    textArray.push(commonWords[randomIndex]);
  }
  
  return textArray.join(" ");
}
