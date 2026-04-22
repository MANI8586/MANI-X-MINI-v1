const fs = require('fs');
const path = require('path');
const settings = require('./settings');
const {
  isPremium, addPremium, delPremium,
  loadUserSettings, saveUserSettings,
  getSessionSetting, setSessionSetting,
  isGroupAdmin, normalizeNumber, cleanJidNumber,
} = require('./helper/function');
const { formatUptime } = require('./helper/utils');
const { applyFont, FONT_COUNT } = require('./helper/fonts');

// ─── Antidelete store ─────────────────────────────────────────────────────────
const antideleteStore = new Map();

function storeMsg(sessionName, m) {
  if (!antideleteStore.has(sessionName)) antideleteStore.set(sessionName, new Map());
  const store = antideleteStore.get(sessionName);
  if (m.message && Object.keys(m.message).length > 0) store.set(m.key.id, m);
  if (store.size > 500) store.delete(store.keys().next().value);
}

function getStoredMsg(sessionName, msgId) {
  const store = antideleteStore.get(sessionName);
  return store ? store.get(msgId) : null;
}

// ─── Download media using downloadContentFromMessage ─────────────────────────
async function downloadMedia(msg, type) {
  const { downloadContentFromMessage } = require('@trashcore/baileys');
  const stream = await downloadContentFromMessage(msg, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

// Detect media type from message object
function getMediaType(msgObj) {
  if (msgObj.imageMessage) return { type: 'image', inner: msgObj.imageMessage };
  if (msgObj.videoMessage) return { type: 'video', inner: msgObj.videoMessage };
  if (msgObj.audioMessage) return { type: 'audio', inner: msgObj.audioMessage };
  if (msgObj.stickerMessage) return { type: 'sticker', inner: msgObj.stickerMessage };
  if (msgObj.documentMessage) return { type: 'document', inner: msgObj.documentMessage };
  return null;
}

// ─── Extract quoted context ───────────────────────────────────────────────────
function getQuotedCtx(m) {
  return m.message?.extendedTextMessage?.contextInfo || null;
}

function getQuotedMsg(m) {
  return m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

// ─── Extract message text ─────────────────────────────────────────────────────
function getMsgText(m) {
  return (
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    m.message?.documentMessage?.caption || ''
  );
}

// ─── Get mentioned jids ───────────────────────────────────────────────────────
function getMentioned(m) {
  return m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
}

// ─── Get target from reply or mention or arg ──────────────────────────────────
function resolveTarget(m, args) {
  const ctx = getQuotedCtx(m);
  if (ctx?.participant) return ctx.participant;
  if (ctx?.remoteJid && !ctx.remoteJid.endsWith('@g.us')) return ctx.remoteJid;

  const mentioned = getMentioned(m);
  if (mentioned.length) return mentioned[0];

  if (args[0]) {
    const num = args[0].replace(/[^0-9]/g, '');
    if (num) return `${num}@s.whatsapp.net`;
  }
  return null;
}

// ─── Font-aware reply ─────────────────────────────────────────────────────────
async function fReply(conn, m, text, sessionName) {
  const fontNum = getSessionSetting(sessionName, 'font', 1);
  const out = (fontNum && fontNum > 1) ? applyFont(text, fontNum) : text;
  await conn.sendMessage(m.key.remoteJid, { text: out }, { quoted: m });
}

async function plainReply(conn, m, text) {
  await conn.sendMessage(m.key.remoteJid, { text }, { quoted: m });
}

// ─── Link regex ───────────────────────────────────────────────────────────────
const LINK_REGEX = /(https?:\/\/|www\.|chat\.whatsapp\.com\/|t\.me\/)[^\s]*/i;
function containsLink(text) { return LINK_REGEX.test(text || ''); }

// ─── Banned users store ───────────────────────────────────────────────────────
const bannedUsers = new Set();

// ──────────────────────────────────────────────────────────────────────────────
// 🔥 NAYA COMMAND LOADER (AUTO-LOAD FROM /commands FOLDER)
// ──────────────────────────────────────────────────────────────────────────────
const COMMANDS = {};
const commandsPath = path.join(__dirname, 'commands');

// Commands folder agar nahi hai to create karein
if (!fs.existsSync(commandsPath)) {
  fs.mkdirSync(commandsPath, { recursive: true });
}

// Sab .js files ko commands folder se load karein
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const commandName = file.replace('.js', '').toLowerCase();
    const commandModule = require(path.join(commandsPath, file));
    if (typeof commandModule === 'function') {
      COMMANDS[commandName] = commandModule;
      process.stdout.write(`[CMD] Loaded: ${commandName}\n`);
    }
  } catch (err) {
    process.stdout.write(`[CMD ERROR] ${file}: ${err.message}\n`);
  }
}

// Agar commands folder khali hai to basic menu load karein
if (Object.keys(COMMANDS).length === 0) {
  COMMANDS['menu'] = require('./commands/menu.js');
}

// ─── Status handler ───────────────────────────────────────────────────────────
async function handleStatus(conn, m, sessionName) {
  const autoView = getSessionSetting(sessionName, 'autoViewStatus', false);
  const autoLike = getSessionSetting(sessionName, 'autoLikeStatus', false);
  if (autoView || autoLike) await conn.readMessages([m.key]);
  if (autoLike) {
    try { await conn.sendMessage(m.key.remoteJid, { react: { text: '❤️', key: m.key } }); } catch {}
  }
}

// ─── Antidelete handler ───────────────────────────────────────────────────────
async function handleDelete(conn, update, sessionName) {
  const enabled = getSessionSetting(sessionName, 'antidelete', false);
  if (!enabled) return;

  const keys = update?.keys || [];
  for (const key of keys) {
    const stored = getStoredMsg(sessionName, key.id);
    if (!stored) continue;
    const remoteJid = stored.key.remoteJid;
    const sender = normalizeNumber(stored.key.participant || stored.key.remoteJid);
    const msg = stored.message;
    if (!msg) continue;

    const header = `🔒 *Antidelete*\n👤 @${sender}`;

    try {
      if (msg.conversation || msg.extendedTextMessage) {
        const text = msg.conversation || msg.extendedTextMessage?.text || '';
        await conn.sendMessage(remoteJid, {
          text: `${header}\n\n${text}`,
          mentions: [`${sender}@s.whatsapp.net`]
        });
      } else if (msg.imageMessage) {
        const buf = await downloadMedia(msg.imageMessage, 'image');
        await conn.sendMessage(remoteJid, { image: buf, caption: `${header}\n${msg.imageMessage.caption || ''}`, mentions: [`${sender}@s.whatsapp.net`] });
      } else if (msg.videoMessage) {
        const buf = await downloadMedia(msg.videoMessage, 'video');
        await conn.sendMessage(remoteJid, { video: buf, caption: `${header}\n${msg.videoMessage.caption || ''}`, mentions: [`${sender}@s.whatsapp.net`] });
      } else if (msg.audioMessage) {
        const buf = await downloadMedia(msg.audioMessage, 'audio');
        await conn.sendMessage(remoteJid, { audio: buf, mimetype: 'audio/mp4' });
        await conn.sendMessage(remoteJid, { text: header, mentions: [`${sender}@s.whatsapp.net`] });
      } else if (msg.stickerMessage) {
        const buf = await downloadMedia(msg.stickerMessage, 'sticker');
        await conn.sendMessage(remoteJid, { sticker: buf });
        await conn.sendMessage(remoteJid, { text: header, mentions: [`${sender}@s.whatsapp.net`] });
      } else if (msg.documentMessage) {
        const buf = await downloadMedia(msg.documentMessage, 'document');
        await conn.sendMessage(remoteJid, { document: buf, mimetype: msg.documentMessage.mimetype, fileName: msg.documentMessage.fileName });
        await conn.sendMessage(remoteJid, { text: header, mentions: [`${sender}@s.whatsapp.net`] });
      }
    } catch (e) {
      process.stdout.write(`[ANTIDELETE ERR] ${e.message}\n`);
    }
  }
}

// ─── Antilink handler ─────────────────────────────────────────────────────────
async function handleAntilink(conn, m, sessionName, senderJid, botNumber) {
  const mode = getSessionSetting(sessionName, 'antilink', 'off');
  if (mode === 'off') return;
  const text = getMsgText(m);
  if (!containsLink(text)) return;
  const remoteJid = m.key.remoteJid;
  const senderNumber = normalizeNumber(senderJid);
  if (senderNumber === botNumber) return;
  if (await isGroupAdmin(conn, remoteJid, senderJid)) return;

  if (mode === 'del') {
    await conn.sendMessage(remoteJid, { delete: m.key });
  } else if (mode === 'warn') {
    await conn.sendMessage(remoteJid, { delete: m.key });
    await conn.sendMessage(remoteJid, {
      text: `⚠️ @${senderNumber} links are not allowed!`,
      mentions: [senderJid]
    });
  } else if (mode === 'kick') {
    await conn.sendMessage(remoteJid, { delete: m.key });
    await conn.groupParticipantsUpdate(remoteJid, [senderJid], 'remove');
  }
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────
async function handleMessage(conn, m, sessionName, ownerNumber) {
  try {
    if (!m?.message) return;
    const remoteJid = m.key.remoteJid;

    if (remoteJid === 'status@broadcast') {
      await handleStatus(conn, m, sessionName);
      return;
    }

    if (m.message.ephemeralMessage) m.message = m.message.ephemeralMessage.message;

    storeMsg(sessionName, m);

    const senderJid = m.key.fromMe
      ? (conn.user.id)
      : (m.key.participant || remoteJid);

    const senderNumber = cleanJidNumber(senderJid);
    const botNumber = cleanJidNumber(conn.user.id);

    if (bannedUsers.has(senderNumber)) return;

    if (remoteJid.endsWith('@g.us')) {
      await handleAntilink(conn, m, sessionName, senderJid, botNumber);
    }

    const userSettings = loadUserSettings(sessionName);
    const prefix = userSettings.prefix || settings.DEFAULT_PREFIX;
    const mode = userSettings.mode || 'public';

    const msgContent = getMsgText(m);
    if (!msgContent.startsWith(prefix)) return;

    const body = msgContent.slice(prefix.length).trim();
    const [commandRaw, ...args] = body.split(' ');
    const command = commandRaw.toLowerCase();

    const storedOwner = cleanJidNumber(userSettings.ownerNumber || '');
    const isOwner = !!(
      senderNumber === cleanJidNumber(ownerNumber) ||
      (storedOwner && senderNumber === storedOwner) ||
      senderNumber === botNumber ||
      m.key.fromMe
    );

    const isUserPremium = isPremium(senderNumber);

    let isAdmin = false;
    if (remoteJid.endsWith('@g.us')) {
      isAdmin = await isGroupAdmin(conn, remoteJid, senderJid);
    }

    if (mode === 'self' && !isOwner) return;

    const ctx = {
      prefix, sessionName, senderNumber, botNumber,
      isOwner, isUserPremium, isAdmin, args, command,
      senderJid, remoteJid,
      // Helper functions for command files
      fReply: (text) => fReply(conn, m, text, sessionName),
      plainReply: (text) => plainReply(conn, m, text),
      getQuotedMsg: () => getQuotedMsg(m),
      getQuotedCtx: () => getQuotedCtx(m),
      getMsgText: () => getMsgText(m),
      resolveTarget: () => resolveTarget(m, args),
      downloadMedia,
      getMediaType,
      settings,
      loadUserSettings: () => loadUserSettings(sessionName),
      saveUserSettings: (data) => saveUserSettings(sessionName, data),
      getSessionSetting: (key, def) => getSessionSetting(sessionName, key, def),
      setSessionSetting: (key, val) => setSessionSetting(sessionName, key, val),
    };

    if (COMMANDS[command]) {
      await COMMANDS[command](conn, m, args, ctx);
    }
  } catch (err) {
    process.stdout.write(`[CASE ERROR] ${err.message}\n`);
  }
}

module.exports = { handleMessage, handleDelete, storeMsg, COMMANDS };
