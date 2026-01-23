import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("BOT_TOKEN missing");
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log("Telegram bot running");

/*firebase setup */

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

// userId -> { step, data }
const reportState = new Map();

function extractUrl(text) {
  if (!text) return null;
  const match = text.match(/https?:\/\/\S+/);
  return match ? match[0] : null;
}

async function fetchOgMetadata(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 8000,
    });
    if (!res.ok) throw new Error("Fetch failed");

    const html = await res.text();
    const $ = cheerio.load(html);

    const getMeta = (p) =>
      $(`meta[property="${p}"]`).attr("content") ||
      $(`meta[name="${p}"]`).attr("content") ||
      null;

    return {
      title: getMeta("og:title") || $("title").text() || null,
      description: getMeta("og:description"),
      image: getMeta("og:image"),
      site_name: getMeta("og:site_name"),
    };
  } catch (e) {
    console.error("OG fetch failed:", e.message);
    return null;
  }
}

// /start -> type -> des -> sns -> media(-) -> loc

/*
incident type 
severity level (-)
Brief description of the incident 
Sns link to the incident - fb , x
Upload media (-)
location sharing  
*/


bot.onText(/\/start/, (msg) => {
  if (msg.chat.type !== "private") return;
  const userId = msg.from.id;

  // Initialize State
  reportState.set(userId, {
    step: "TYPE",
    data: {},
  });

  bot.sendMessage(msg.chat.id, "🚨 *NEW INCIDENT REPORT*\n\nFirst, select the incident type:", {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔥 Fire", callback_data: "type_fire" }, { text: "🚑 Accident", callback_data: "type_accident" }],
        [{ text: "🌊 Flood", callback_data: "type_flood" }, { text: "🏗 Collapse", callback_data: "type_collapse" }],
        [{ text: "❓ Other", callback_data: "type_other" }]
      ]
    }
  });
});

//for type and severity levels
bot.on("callback_query", async (callbackQuery) => {
  const msg = callbackQuery.message;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;
  const state = reportState.get(userId);

  if (!state) return;
  bot.answerCallbackQuery(callbackQuery.id); // Stop loading animation

  if (state.step === "TYPE" && data.startsWith("type_")) {
    const selectedType = data.replace("type_", "");
    state.data.type = selectedType;

    state.step = "SEVERITY";
    reportState.set(userId, state);

    bot.editMessageText(`✅ Type: ${selectedType.toUpperCase()}`, {
      chat_id: msg.chat.id,
      message_id: msg.message_id
    });

    bot.sendMessage(msg.chat.id, "⚠️ Assign Severity Level to the incident:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔴 High", callback_data: "sev_high" }],
          [{ text: "🟠 Medium", callback_data: "sev_medium" }],
          [{ text: "🟢 Low", callback_data: "sev_low" }],
          [{ text: "⏭ Skip (Unknown)", callback_data: "sev_skip" }]
        ]
      }
    });
  }

  else if (state.step === "SEVERITY" && data.startsWith("sev_")) {

    // if click skip-> unidentified (grey as tag) and if else high, med, low
    const selectedSev = data === "sev_skip" ? "unidentified" : data.replace("sev_", "");

    state.data.severity = selectedSev;

    // Move to next step snsurl
    state.step = "URL";
    reportState.set(userId, state);

    //should test it with like double links or sth.
    bot.editMessageText(`✅ Severity: ${selectedSev.toUpperCase()}`, {
      chat_id: msg.chat.id,
      message_id: msg.message_id
    });

    bot.sendMessage(
      msg.chat.id,
      "🔗 *SNS LINK REQUIRED*\n\nPlease paste the link to the social media post (Facebook, X, etc):",
      { parse_mode: "Markdown" }
    );
  }
});


bot.on("message", async (msg) => {
  if (msg.chat.type !== "private" || msg.text?.startsWith("/")) return;

  const userId = msg.from?.id;
  const state = reportState.get(userId);
  if (!state) return;

  if (state.step === "URL") {
    const url = extractUrl(msg.text);

    if (!url) {
      bot.sendMessage(msg.chat.id, "❌ **Invalid Link**\n\nWe need a valid SNS source link to verify this incident.\n👇 *Paste the link below:*", { parse_mode: "Markdown" });
      return;
    }

    //URL Accepted
    bot.sendMessage(msg.chat.id, "🔎 Verifying link...", { disable_notification: true });
    const ogMeta = await fetchOgMetadata(url);

    state.data.source_url = url;
    state.data.og_meta = ogMeta;

    state.step = "DETAILS";
    reportState.set(userId, state);

    bot.sendMessage(
      msg.chat.id,
      "Link Accepted!\n\n📝 **DESCRIPTION REQUIRED**\n\nPlease write a brief description (e.g., 'Large fire visible from highway').\n*If you upload media, put text in the caption!*",
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (state.step === "DETAILS") {
    // Capture manual text OR photo caption
    const rawText = msg.text || msg.caption || "";

    if (!rawText || rawText.trim().length === 0) {
      bot.sendMessage(msg.chat.id, "❌ **Description Missing**\n\nYou must provide a text description to proceed.", { parse_mode: "Markdown" });
      return;
    }

    //Text Accepted
    state.data.text = rawText;

    state.step = "LOCATION";
    reportState.set(userId, state);

    bot.sendMessage(
      msg.chat.id,
      "📍 *FINAL STEP*\n\nPlease share the location using Telegram location sharing (Paperclip -> Location).",
      { parse_mode: "Markdown" }
    );
    return;
  }

  //need to fix the location. 
  //saves only half of the add
  //need to fix the location. 
  //saves only half of the add
  if (msg.location && state.step === "LOCATION") {

    bot.sendMessage(msg.chat.id, "⏳ Saving report...");

    let addressString = "Unknown Location";

    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) throw new Error("Missing Google API Key");

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${msg.location.latitude},${msg.location.longitude}&key=${apiKey}&language=en`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "OK" && data.results.length > 0) {
        const fullAddress = data.results[0].formatted_address;

        // Cleanup: Remove "South Korea" and Zip Codes (5 digits) to make it shorter, include???
        addressString = fullAddress.replace(", South Korea", "").replace(/\d{5}/, "").trim();

        if (addressString.endsWith(",")) addressString = addressString.slice(0, -1);
      }
    } catch (e) {
      console.error("Google Geocode failed:", e.message);
      // Fallback: Just save coordinates if API fails
      addressString = `Lat: ${msg.location.latitude}, Lng: ${msg.location.longitude}`;
    }

    // firebase saving logic
    try {
      await addDoc(reportsRef, {
        type: state.data.type,
        priority: state.data.severity,
        text: state.data.text,
        source_url: state.data.source_url,

        // Open Graph meta data
        //only works for fb for now
        og_title: state.data.og_meta?.title ?? null, //sns post owner
        og_description: state.data.og_meta?.description ?? null, //sns caption
        og_image: state.data.og_meta?.image ?? null,//takes only the first pic for multiple ones
        og_site: state.data.og_meta?.site_name ?? null, //currently not showing

        // Location
        reporter_lat: msg.location.latitude,
        reporter_lng: msg.location.longitude,
        location_name: addressString,

        source_platform: "telegram",
        created_at: new Date(),
      });

      bot.sendMessage(msg.chat.id, `✅ **Report Saved!**\n\nThank you for your contribution.`, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("Firestore error:", err);
      bot.sendMessage(msg.chat.id, "❌ Error saving report.");
    }

    reportState.delete(userId);
  }
});