import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestWaWebVersion
} from "@whiskeysockets/baileys";

import qrcode from "qrcode-terminal";
import pino from "pino";

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("./auth_info");
    const { version } = await fetchLatestWaWebVersion();

console.log("WhatsApp Web version:", version.join("."));

const sock = makeWASocket({
  version,
  auth: state,
  logger: pino({ level: "silent" }),
  printQRInTerminal: false,
  markOnlineOnConnect: false
});
  

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Scan this QR code with WhatsApp:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("WhatsApp connected successfully!");
    }

    if (connection === "close") {
  const err = lastDisconnect?.error;
  const code = err?.output?.statusCode;

  console.log("Connection closed");
  console.log("Status code:", code);
  console.log("Error:", err?.message);
  console.log("Full error:", err);

  if (code === DisconnectReason.loggedOut) {
    console.log("Logged out. Delete the saved session only if you intend to relink.");
    return;
  }

  console.log("Retrying in 5 seconds...");
  setTimeout(() => startBot(), 5000);
}
  });

const lastChecked = new Map();
const lastAction = new Map();

const CHECK_INTERVAL = 15_000;
const ACTION_COOLDOWN = 90_000;

sock.ev.on("messages.upsert", async ({ messages }) => {
  for (const msg of messages) {
    if (!msg.message || msg.key.fromMe) continue;

    const groupId = msg.key.remoteJid;

    if (!groupId?.endsWith("@g.us")) continue;

    const message =
      msg.message.conversation ??
      msg.message.extendedTextMessage?.text ??
      msg.message.imageMessage?.caption ??
      msg.message.videoMessage?.caption ??
      "";

    if (!message.trim()) continue;

    const senderId = msg.key.participant ?? null;

    try {
      // 1. Save the message first
      const saved = await fetch(
        "http://127.0.0.1:8000/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            group_id: groupId,
            sender_id: senderId,
            message,
            timestamp: msg.messageTimestamp
              ? new Date(
                  Number(msg.messageTimestamp) * 1000
                ).toISOString()
              : new Date().toISOString()
          })
        }
      );

      if (!saved.ok) {
        console.error("Message storage failed:", saved.status);
        continue;
      }

      console.log("Saved:", groupId, message);

      // 2. Limit how often the AI evaluates this group
      const now = Date.now();

      if (
        now - (lastChecked.get(groupId) ?? 0)
        < CHECK_INTERVAL
      ) {
        continue;
      }

      lastChecked.set(groupId, now);

      // 3. Avoid frequent group replies/reactions
      if (
        now - (lastAction.get(groupId) ?? 0)
        < ACTION_COOLDOWN
      ) {
        continue;
      }

      // 4. Ask the AI what to do
      const res = await fetch(
        "http://127.0.0.1:8000/decide",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            group_id: groupId,
            limit: 25
          })
        }
      );

      if (!res.ok) {
        console.error("AI decision failed:", res.status);
        continue;
      }

      const decision = await res.json();

    console.log("AI decision:", decision.action);
    console.log("AI reason:", decision.reason);
      // 5. Act only when the AI chooses to
      if (decision.action === "none") continue;

      if (
        ["react", "both"].includes(decision.action) &&
        decision.emoji
      ) {
        await sock.sendMessage(groupId, {
          react: {
            text: decision.emoji,
            key: msg.key
          }
        });
      }

      if (
        ["reply", "both"].includes(decision.action) &&
        decision.reply?.trim()
      ) {
        await sock.sendMessage(
          groupId,
          { text: decision.reply },
          { quoted: msg }
        );
      }

      lastAction.set(groupId, Date.now());

    } catch (err) {
      console.error("Group processing error:", err.message);
    }
  }
});
}

startBot().catch(console.error);