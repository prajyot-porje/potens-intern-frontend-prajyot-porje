import { STORAGE_KEYS } from "../utils/constants";

export interface Submission {
  id: string;                      // Unique ID (e.g., "RD-7X9K2")
  category: string;                // Category identifier key (e.g., "roads")
  description: string;             // Text body (Max 500 chars)
  photo: string | null;            // Base64 compressed image string or null
  usedVoiceInput: boolean;         // Dictation metrics flag
  createdAt: string;               // ISO 8601 string timestamp
  status: "queued" | "submitted";  // Offline-first queue state
  language: "en" | "mr";           // Active language during submission
}

/**
 * Retrieves all submissions stored in the browser's localStorage.
 */
export function getSubmissions(): Submission[] {
  if (typeof window === "undefined") return [];
  try {
    const data = window.localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading submissions from localStorage:", error);
    return [];
  }
}

/**
 * Saves a single submission. If it already exists, updates it; otherwise, prepends it.
 */
export function saveSubmission(submission: Submission): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSubmissions();
    const index = current.findIndex((item) => item.id === submission.id);

    if (index > -1) {
      current[index] = submission;
    } else {
      current.unshift(submission); // Prepend new submissions
    }

    window.localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(current));
  } catch (error) {
    console.error("Error saving submission to localStorage:", error);
  }
}

/**
 * Retrieves a submission by its unique reference ID.
 */
export function getSubmissionById(id: string): Submission | null {
  const current = getSubmissions();
  return current.find((item) => item.id === id) || null;
}

/**
 * Removes a submission by its reference ID.
 */
export function deleteSubmission(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSubmissions();
    const filtered = current.filter((item) => item.id !== id);
    window.localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting submission from localStorage:", error);
  }
}

/**
 * Synchronizes queued submissions, setting their status to 'submitted'.
 * Returns the count of synced items.
 */
export function syncQueuedSubmissions(): number {
  if (typeof window === "undefined") return 0;
  try {
    const current = getSubmissions();
    let syncCount = 0;

    const updated = current.map((item) => {
      if (item.status === "queued") {
        syncCount++;
        return { ...item, status: "submitted" as const };
      }
      return item;
    });

    if (syncCount > 0) {
      window.localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
    }

    return syncCount;
  } catch (error) {
    console.error("Error syncing queued submissions:", error);
    return 0;
  }
}
