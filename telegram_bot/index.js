import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

/* -------------------- ENV -------------------- */

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN missing in .env");
  process.exit(1);
}

/* -------------------- TELEGRAM -------------------- */

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🤖 Telegram bot is running");

/* -------------------- FIREBASE -------------------- */

const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  appId: process.env.FB_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const reportsRef = collection(db, "reports");

/* -------------------- GROUPING BUFFER -------------------- */

const pendingReports = new Map();
// key: telegram user id
// value: { text?, source_url?, createdAt }

/* -------------------- HELPERS -------------------- */

function extractUrl(text) {
  if (!text) return null;
  const match = text.match(/https?:\/\/\S+/);
  return match ? match[0] : null;
}

/* -------------------- MESSAGE HANDLER -------------------- */

bot.on("message", async (msg) => {
  const userId = msg.from?.id;
  if (!userId) return;

  const existing = pendingReports.get(userId) || {
    createdAt: Date.now(),
  };

  /* ---------- LOCATION (FINALIZE REPORT) ---------- */
  if (msg.location) {
    console.log("Location received from", userId);

    try {
      await addDoc(reportsRef, {
        text: existing.text ?? null,
        source_url: existing.source_url ?? null,
        reporter_lat: msg.location.latitude,
        reporter_lng: msg.location.longitude,
        source_platform: "telegram",
        created_at: new Date(),
      });

      console.log("Report saved to Firestore");
    } catch (err) {
      console.error("Firestore error:", err);
    }

    pendingReports.delete(userId);
    return;
  }

  /* ---------- TEXT ---------- */
  if (msg.text) {
  const url = extractUrl(msg.text);
  const isOnlyUrl = url && msg.text.trim() === url;

  pendingReports.set(userId, {
    ...existing,
    text: isOnlyUrl ? null : msg.text,
    source_url: url ?? existing.source_url,
    createdAt: Date.now(),
  });

  console.log("📝 Text / URL received from", userId);
}

});

/* -------------------- CLEANUP (OPTIONAL) -------------------- */

setInterval(() => {
  const now = Date.now();

  for (const [userId, report] of pendingReports) {
    if (now - report.createdAt > 5 * 60 * 1000) {
      pendingReports.delete(userId);
      console.log("Cleared stale report for", userId);
    }
  }
}, 60 * 1000);
