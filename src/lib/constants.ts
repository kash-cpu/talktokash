export const BRAND = {
  name: "TalkToKash",
  host: "Kash",
  fullName: "Abdulazeez Kasheem",
  email: "talktokash.now@gmail.com",
};

export const SESSION_MINUTES = 30;
export const HOURS_START = 10;
export const HOURS_END = 22;

export const CATEGORIES = [
  { id: "relationship", title: "Relationship", desc: "Dating, communication, conflict, trust, breakups." },
  { id: "marriage", title: "Marriage", desc: "Spouse, in-laws, parenting, intimacy, decisions." },
  { id: "personal", title: "Personal Growth", desc: "Career, talent management, confidence, direction." },
  { id: "depression", title: "Depression & Mood", desc: "Feeling stuck, low, anxious. A safe ear." },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const SESSION_TYPES = [
  { id: "audio", title: "Audio", desc: "Voice-only call. No camera needed.", price: 40000, icon: "phone" },
  { id: "video", title: "Video", desc: "Face-to-face on Google Meet.", price: 50000, icon: "video" },
] as const;

export type SessionType = (typeof SESSION_TYPES)[number]["id"];

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
