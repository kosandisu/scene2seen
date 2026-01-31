import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from 'fs';
import os from 'os';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("BOT_TOKEN missing");
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, {
  polling: {
    autoStart: false,
    interval: 300,
    params: { timeout: 10 },
  },
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error?.response?.body || error);
});

bot.on("webhook_error", (error) => {
  console.error("Webhook error:", error?.response?.body || error);
});

(async () => {
  try {
    await bot.deleteWebHook();
  } catch (error) {
    console.error("Failed to delete webhook:", error?.response?.body || error);
  }
  try {
    await bot.setMyCommands([
      {
        command: "start",
        description: "Start a new incident report",
      },
    ]);
    if (typeof bot.setChatMenuButton === "function") {
      await bot.setChatMenuButton({ menu_button: { type: "commands" } });
    }
  } catch (error) {
    console.error("Failed to set bot commands:", error?.response?.body || error);
  }
  bot.startPolling();
  console.log("Telegram bot running");
})();

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
const storage = getStorage(app);

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

async function uploadTelegramFileToFirebase(fileId, filePathInBucket) {
  try {
    const fileLink = await bot.getFileLink(fileId);
    const res = await fetch(fileLink);
    const buffer = await res.arrayBuffer();

    // Check if transcoding is needed (TG voice is .oga or .ogg)
    if (filePathInBucket.endsWith('.oga') || filePathInBucket.endsWith('.ogg')) {
      console.log(`Transcoding voice memo: ${filePathInBucket} -> mp3`);
      const tempId = Math.random().toString(36).substring(7);
      const tempInput = path.join(os.tmpdir(), `input_${tempId}.oga`);
      const tempOutput = path.join(os.tmpdir(), `output_${tempId}.mp3`);

      // Write temp input file
      fs.writeFileSync(tempInput, Buffer.from(buffer));

      // Transcode
      await new Promise((resolve, reject) => {
        ffmpeg(tempInput)
          .toFormat('mp3')
          .on('end', () => {
            console.log('Transcoding finished');
            resolve();
          })
          .on('error', (err) => {
            console.error('ffmpeg error:', err);
            reject(err);
          })
          .save(tempOutput);
      });

      // Read output file
      const mp3Buffer = fs.readFileSync(tempOutput);

      // Cleanup
      try { fs.unlinkSync(tempInput); fs.unlinkSync(tempOutput); } catch (e) { }

      // Update path (replace extension)
      const mp3Path = filePathInBucket.replace(/\.oga$|\.ogg$/, '.mp3');
      const fileRef = storageRef(storage, mp3Path);

      // Upload MP3 with correct metadata
      await uploadBytes(fileRef, new Uint8Array(mp3Buffer), { contentType: 'audio/mpeg' });
      return await getDownloadURL(fileRef);
    }

    // Normal upload for images etc
    const fileRef = storageRef(storage, filePathInBucket);
    await uploadBytes(fileRef, new Uint8Array(buffer)); // Firebase v9 expects Uint8Array or Blob
    const downloadUrl = await getDownloadURL(fileRef);
    return downloadUrl;
  } catch (error) {
    console.error("File upload error:", error);
    return null;
  }
}

// /start -> type -> des -> sns -> media(-) -> loc

/*
incident type 
severity level (-)
Brief description of the incident 
Sns link to the incident - fb , x || img upload || voice memo shi
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
        [{ text: "🔥 Fire", callback_data: "type_Fire" }, { text: "🚑 Accident", callback_data: "type_Accident" }],
        [{ text: "🌊 Flood", callback_data: "type_Flood" }, { text: "🏗 Collapse", callback_data: "type_Collapse" }],
        [{ text: "❓ Other", callback_data: "type_Other" }]
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

    // Move to next step evidence
    state.step = "EVIDENCE";
    reportState.set(userId, state);

    //should test it with like double links or sth.
    bot.editMessageText(`✅ Severity: ${selectedSev.toUpperCase()}`, {
      chat_id: msg.chat.id,
      message_id: msg.message_id
    });

    bot.sendMessage(
      msg.chat.id,
      "📂 *EVIDENCE REQUIRED*\n\nPlease provide at least one of the following:\n- 🔗 Paste a **Link** (SNS/News)\n- 📸 Upload a **Photo**\n- 🎤 Send a **Voice Memo**\n\n_You can send multiple items._\n\n✅ Type /done when finished.",
      { parse_mode: "Markdown" }
    );
  }
});


bot.on("message", async (msg) => {
  if (msg.chat.type !== "private" || (msg.text?.startsWith("/") && msg.text !== "/done")) return;

  const userId = msg.from?.id;
  const state = reportState.get(userId);
  if (!state) return;

  if (state.step === "EVIDENCE") {
    // Handle /done command
    if (msg.text === "/done") {
      const hasLink = !!state.data.source_url;
      const hasImage = !!state.data.evidence_image_url;
      const hasVoice = !!state.data.evidence_voice_url;

      if (!hasLink && !hasImage && !hasVoice) {
        bot.sendMessage(msg.chat.id, "❌ **No Evidence Provided**\n\nPlease send at least one (Link, Photo, or Voice info) before typing /done.", { parse_mode: "Markdown" });
        return;
      }

      state.step = "DETAILS";
      reportState.set(userId, state);
      bot.sendMessage(msg.chat.id, "✅ Evidence Saved!\n\n📝 **DESCRIPTION REQUIRED**\n\nPlease write a brief description (e.g., 'Large fire visible from highway').", { parse_mode: "Markdown" });
      return;
    }

    // Handle Link (Text)
    const url = extractUrl(msg.text);
    if (url) {
      bot.sendMessage(msg.chat.id, "🔎 Verifying link...", { disable_notification: true });
      const ogMeta = await fetchOgMetadata(url);
      state.data.source_url = url;
      state.data.og_meta = ogMeta;
      reportState.set(userId, state);
      bot.sendMessage(msg.chat.id, `🔗 Link added! \n\nAdd more evidence or type /done.`);
      return;
    }

    // Handle Photo
    if (msg.photo && msg.photo.length > 0) {
      const fileId = msg.photo[msg.photo.length - 1].file_id; // Best quality
      bot.sendMessage(msg.chat.id, "☁️ Uploading photo...", { disable_notification: true });
      const downloadUrl = await uploadTelegramFileToFirebase(fileId, `evidence/images/${userId}_${Date.now()}.jpg`);

      if (downloadUrl) {
        state.data.evidence_image_url = downloadUrl; // Currently stores only last one, can allow array if needed
        reportState.set(userId, state);
        bot.sendMessage(msg.chat.id, "📸 Photo saved! \n\nAdd more evidence or type /done.");
      } else {
        bot.sendMessage(msg.chat.id, "❌ Photo upload failed.");
      }
      return;
    }

    // Handle Voice
    if (msg.voice) {
      const fileId = msg.voice.file_id;
      bot.sendMessage(msg.chat.id, "☁️ Uploading voice memo...", { disable_notification: true });
      const downloadUrl = await uploadTelegramFileToFirebase(fileId, `evidence/voice/${userId}_${Date.now()}.oga`);

      if (downloadUrl) {
        state.data.evidence_voice_url = downloadUrl;
        reportState.set(userId, state);
        bot.sendMessage(msg.chat.id, "🎤 Voice memo saved! \n\nAdd more evidence or type /done.");
      } else {
        bot.sendMessage(msg.chat.id, "❌ Voice upload failed.");
      }
      return;
    }

    if (!msg.text) {
      bot.sendMessage(msg.chat.id, "❌ Unsupported file type. Please send a Link, Photo, or Voice Memo.");
    }
    // If text but not a link and not /done, probably a confused user or description early
    if (msg.text && !url && msg.text !== "/done") {
      bot.sendMessage(msg.chat.id, "⚠️ **Text received but not a link.**\nIf this is a description, please finish specificing evidence first by typing /done.\nIf it's a link, check the format.");
    }
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

        source_url: state.data.source_url || null,
        evidence_image_url: state.data.evidence_image_url || null,
        evidence_voice_url: state.data.evidence_voice_url || null,

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