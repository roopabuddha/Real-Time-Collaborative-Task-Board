export interface Task {
  id:          string;
  title:       string;
  description: string | null;     // ← Matches String? (nullable in DB)
  column:      "TODO" | "IN_PROGRESS" | "DONE";
  position:    number;            // ← Float in DB → number in JS/TS (safe)
  version:     number;
  createdAt:   string;            // ISO string from JSON
  updatedAt:   string;            // ISO string from JSON
}

export interface UserPresence {
  userId: string;
  name:   string;
  color:  string;                 // Optional: for avatar bg color
}