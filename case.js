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
async function fReply(conn, m, text, sessionName, mentions = []) {
  const fontNum = getSessionSetting(sessionName, 'font', 1);
  const out = (fontNum && fontNum > 1) ? applyFont(text, fontNum) : text;
  await conn.sendMessage(m.key.remoteJid, { text: out, mentions }, { quoted: m });
}

async function plainReply(conn, m, text) {
  await conn.sendMessage(m.key.remoteJid, { text }, { quoted: m });
}

// ─── Link regex ───────────────────────────────────────────────────────────────
const LINK_REGEX = /(https?:\/\/|www\.|chat\.whatsapp\.com\/|t\.me\/)[^\s]*/i;
function containsLink(text) { return LINK_REGEX.test(text || ''); }

// ─── Banned users store ───────────────────────────────────────────────────────
const bannedUsers = new Set();

// ─── Bad Words List (Anti-Toxic) ──────────────────────────────────────────────
const BAD_WORDS = [
  'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'dick', 'pussy', 'cunt',
  'madarchod', 'bhenchod', 'harami', 'kutta', 'suar', 'gali', 'gaali',
  // Add more as needed
];

// ──────────────────────────────────────────────────────────────────────────────
// 🔥 NAYA COMMAND LOADER (Aliases + Description Support)
// ──────────────────────────────────────────────────────────────────────────────
const COMMANDS = {};
const ALIASES_MAP = new Map();
const COMMANDS_INFO = new Map();

const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
  fs.mkdirSync(commandsPath, { recursive: true });
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const commandModule = require(path.join(commandsPath, file));
    
    // Naye format ke liye
    if (commandModule.name && commandModule.run) {
      const cmdName = commandModule.name.toLowerCase();
      COMMANDS[cmdName] = commandModule.run;
      COMMANDS_INFO.set(cmdName, {
        description: commandModule.description || 'No description',
        category: commandModule.category || 'General',
        isOwner: commandModule.isOwner || false,
        isAdmin: commandModule.isAdmin || false,
        isPremium: commandModule.isPremium || false,
        aliases: commandModule.aliases || []
      });
      
      // Aliases register karein
      if (commandModule.aliases) {
        for (const alias of commandModule.aliases) {
          ALIASES_MAP.set(alias.toLowerCase(), cmdName);
        }
      }
      
      process.stdout.write(`[CMD] Loaded: ${cmdName}\n`);
    }
    // Purane format ke liye (backward compatibility)
    else if (typeof commandModule === 'function') {
      const commandName = file.replace('.js', '').toLowerCase();
      COMMANDS[commandName] = commandModule;
      COMMANDS_INFO.set(commandName, {
        description: 'No description',
        category: 'General',
        isOwner: false,
        isAdmin: false,
        isPremium: false,
        aliases: []
      });
      process.stdout.write(`[CMD] Loaded (old): ${commandName}\n`);
    }
  } catch (err) {
    process.stdout.write(`[CMD ERROR] ${file}: ${err.message}\n`);
  }
}

// Agar commands folder khali hai to basic menu load karein
if (Object.keys(COMMANDS).length === 0) {
  try {
    COMMANDS['menu'] = require('./commands/menu.js');
  } catch (e) {
    process.stdout.write(`[MENU ERROR] ${e.message}\n`);
  }
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

// ─── Anti-Toxic Handler ───────────────────────────────────────────────────────
async function handleAntiToxic(conn, m, sessionName, senderJid) {
  const mode = getSessionSetting(sessionName, 'antitoxic', 'off');
  if (mode === 'off') return false;
  
  const text = getMsgText(m).toLowerCase();
  const hasBadWord = BAD_WORDS.some(word => text.includes(word));
  if (!hasBadWord) return false;
  
  const remoteJid = m.key.remoteJid;
  const senderNumber = normalizeNumber(senderJid);
  
  // Admin ko skip karein
  if (await isGroupAdmin(conn, remoteJid, senderJid)) return false;
  
  if (mode === 'del') {
    await conn.sendMessage(remoteJid, { delete: m.key });
  } else if (mode === 'warn') {
    await conn.sendMessage(remoteJid, { delete: m.key });
    await conn.sendMessage(remoteJid, {
      text: `⚠️ @${senderNumber} bad words are not allowed!`,
      mentions: [senderJid]
    });
    
    // Warning system call
    await addWarning(remoteJid, senderJid, 'Bad language');
  } else if (mode === 'kick') {
    await conn.sendMessage(remoteJid, { delete: m.key });
    await conn.groupParticipantsUpdate(remoteJid, [senderJid], 'remove');
  }
  
  return true;
}

// ─── Warning System Functions ─────────────────────────────────────────────────
const warningsPath = path.join(__dirname, 'database/warnings.json');
if (!fs.existsSync(warningsPath)) fs.writeFileSync(warningsPath, '{}');

function getWarnings() {
  try {
    return JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveWarnings(data) {
  fs.writeFileSync(warningsPath, JSON.stringify(data, null, 2));
}

async function addWarning(groupId, userJid, reason) {
  const warnings = getWarnings();
  if (!warnings[groupId]) warnings[groupId] = {};
  if (!warnings[groupId][userJid]) warnings[groupId][userJid] = { count: 0, reasons: [] };
  
  warnings[groupId][userJid].count++;
  warnings[groupId][userJid].reasons.push({ reason, date: new Date().toISOString() });
  saveWarnings(warnings);
  
  return warnings[groupId][userJid].count;
}

// ─── Welcome/Goodbye Handler ──────────────────────────────────────────────────
async function handleWelcomeGoodbye(conn, groupJid, userJid, action, sessionName) {
  if (action === 'add') {
    const welcomeMsg = getSessionSetting(sessionName, `welcome_${groupJid}`, null);
    if (!welcomeMsg) return;
    
    const groupMeta = await conn.groupMetadata(groupJid);
    const groupName = groupMeta.subject;
    const memberCount = groupMeta.participants.length;
    const userName = `@${userJid.split('@')[0]}`;
    
    let msg = welcomeMsg
      .replace(/{name}/g, userName)
      .replace(/{group}/g, groupName)
      .replace(/{count}/g, memberCount)
      .replace(/@user/g, userName);
    
    await conn.sendMessage(groupJid, { text: msg, mentions: [userJid] });
  } else if (action === 'remove') {
    const goodbyeMsg = getSessionSetting(sessionName, `goodbye_${groupJid}`, null);
    if (!goodbyeMsg) return;
    
    const groupMeta = await conn.groupMetadata(groupJid);
    const groupName = groupMeta.subject;
    const userName = `@${userJid.split('@')[0]}`;
    
    let msg = goodbyeMsg
      .replace(/{name}/g, userName)
      .replace(/{group}/g, groupName)
      .replace(/@user/g, userName);
    
    await conn.sendMessage(groupJid, { text: msg, mentions: [userJid] });
  }
}

// ─── Anti-Bot Handler ─────────────────────────────────────────────────────────
async function handleAntiBot(conn, groupJid, userJid, sessionName) {
  const enabled = getSessionSetting(sessionName, 'antibot', false);
  if (!enabled) return;
  
  // Check if user is bot (simple check - you can expand)
  const botPatterns = ['bot', 'assistant', 'ai', 'auto'];
  const userNumber = normalizeNumber(userJid);
  
  // Agar user ka number bot pattern match kare to kick
  // Yeh aap customize kar sakte hain
  const isSuspicious = botPatterns.some(p => userNumber.includes(p));
  
  if (isSuspicious) {
    try {
      await conn.groupParticipantsUpdate(groupJid, [userJid], 'remove');
      process.stdout.write(`[ANTIBOT] Kicked ${userJid} from ${groupJid}\n`);
    } catch (e) {}
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

// ─── Auto-Sticker Handler ─────────────────────────────────────────────────────
async function handleAutoSticker(conn, m, sessionName) {
  const enabled = getSessionSetting(sessionName, 'autosticker', false);
  if (!enabled) return false;
  
  const imageMsg = m.message?.imageMessage;
  if (!imageMsg) return false;
  
  try {
    const buf = await downloadMedia(imageMsg, 'image');
    await conn.sendMessage(m.key.remoteJid, { sticker: buf }, { quoted: m });
    return true;
  } catch (e) {
    return false;
  }
}

// ─── Auto-Reply Handler ───────────────────────────────────────────────────────
async function handleAutoReply(conn, m, sessionName, body) {
  const autoReplies = getSessionSetting(sessionName, 'autoreply', {});
  const reply = autoReplies[body.toLowerCase()];
  if (reply) {
    await fReply(conn, m, reply, sessionName);
    return true;
  }
  return false;
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

    const userSettings = loadUserSettings(sessionName);
    const prefix = userSettings.prefix || settings.DEFAULT_PREFIX;
    const mode = userSettings.mode || 'public';

    const msgContent = getMsgText(m);
    const body = msgContent.startsWith(prefix) ? msgContent.slice(prefix.length).trim() : msgContent;

    // ─── Group Protection Features ───────────────────────────────────────────
    if (remoteJid.endsWith('@g.us')) {
      await handleAntilink(conn, m, sessionName, senderJid, botNumber);
      const toxic = await handleAntiToxic(conn, m, sessionName, senderJid);
      if (toxic) return; // Stop if message was toxic and deleted
    }

    // ─── Auto-Sticker Check ──────────────────────────────────────────────────
    const autoStickerDone = await handleAutoSticker(conn, m, sessionName);
    if (autoStickerDone) return;

    // ─── Check if it's a command ─────────────────────────────────────────────
    if (!msgContent.startsWith(prefix)) {
      // Not a command - check auto-reply
      await handleAutoReply(conn, m, sessionName, body);
      return;
    }

    const [commandRaw, ...args] = body.split(' ');
    let command = commandRaw.toLowerCase();

    // ─── Alias Check ─────────────────────────────────────────────────────────
    if (ALIASES_MAP.has(command)) {
      command = ALIASES_MAP.get(command);
    } else {
      // Fallback to old ALIASES object
      const ALIASES = {
        'setprefix': ['sp', 'changeprefix', 'prefix'],
        'setowner': ['so', 'changeowner'],
        'setbotname': ['sbn', 'changebotname', 'botname'],
        'setmenuimg': ['smi', 'menuimage', 'changemenuimg'],
        'setfonts': ['sf', 'changefont', 'fontstyle'],
        'fonts': ['fontlist', 'listfonts', 'fl'],
        'public': ['pub', 'publicmode'],
        'self': ['selfmode'],
        'addprem': ['ap', 'addpremium', 'premadd'],
        'delprem': ['dp', 'delpremium', 'premdel'],
        'ban': ['block','chup', 'banuser'],
        'unban': ['unblock', 'unbanuser'],
        'promote': ['p','prom', 'admin', 'makeadmin'],
        'demote': ['dem', 'dismiss','unadmin', 'removeadmin'],
        'kick': ['remove', 'k','bc', 'nikal','bye'],
        'add': ['invite', 'a'],
        'tagall': ['ta', 'everyone', 'all', 'tag'],
        'group': ['g', 'gc', 'groupmode'],
        'groupinfo': ['gi', 'ginfo', 'groupdata'],
        'mute': ['m', 'silent', 'shutup'],
        'unmute': ['um', 'unsilent', 'speak'],
        'autoviewstatus': ['avs', 'viewstatus', 'autoview'],
        'autolikestatus': ['als', 'likestatus', 'autolike'],
        'antilink': ['al', 'linkprotect', 'nolink'],
        'antidelete': ['ad', 'antidel', 'deletemsg'],
        'sticker': ['s', 'st', 'stik'],
        'toimg': ['ti', 'imagify', 'stickertoimg'],
        'vv': ['savevv', 'done'],
        'copy': ['cp', 'clone', 'dup'],
        'menu': ['help', 'm', 'cmds', 'commands', 'list','listmenu','allmenu'],
        'ping': ['p', 'speed', 'test'],
        'uptime': ['up', 'time', 'online'],
        'runtime': ['rt', 'status', 'stats'],
        'owner': ['dev', 'creator', 'founder']
      };
      
      for (const [mainCmd, aliases] of Object.entries(ALIASES)) {
        if (aliases.includes(command)) {
          command = mainCmd;
          break;
        }
      }
    }

    // ─── Permission Checks ───────────────────────────────────────────────────
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

    // ─── Lock Check ──────────────────────────────────────────────────────────
    const lockedCommands = getSessionSetting(sessionName, 'lockedCommands', []);
    if (lockedCommands.includes(command) && !isOwner && !isAdmin) {
      await plainReply(conn, m, `🔒 Command *${prefix}${command}* is locked in this group.`);
      return;
    }

    // ─── Command Info Check ──────────────────────────────────────────────────
    const cmdInfo = COMMANDS_INFO.get(command);
    if (cmdInfo) {
      if (cmdInfo.isOwner && !isOwner) return;
      if (cmdInfo.isAdmin && !isOwner && !isAdmin) {
        await fReply(conn, m, '❌ Admin only.', sessionName);
        return;
      }
      if (cmdInfo.isPremium && !isOwner && !isUserPremium) {
        await fReply(conn, m, '❌ Premium only.', sessionName);
        return;
      }
    }

    // ─── Context Object ──────────────────────────────────────────────────────
    const ctx = {
      prefix, sessionName, senderNumber, botNumber,
      isOwner, isUserPremium, isAdmin, args, command,
      senderJid, remoteJid,
      fReply: (text, mentions = []) => fReply(conn, m, text, sessionName, mentions),
      plainReply: (text) => plainReply(conn, m, text),
      getQuotedMsg: () => getQuotedMsg(m),
      getQuotedCtx: () => getQuotedCtx(m),
      getMsgText: () => getMsgText(m),
      resolveTarget: () => resolveTarget(m, args),
      downloadMedia,
      getMediaType,
      settings,
      COMMANDS_INFO,
      loadUserSettings: () => loadUserSettings(sessionName),
      saveUserSettings: (data) => saveUserSettings(sessionName, data),
      getSessionSetting: (key, def) => getSessionSetting(sessionName, key, def),
      setSessionSetting: (key, val) => setSessionSetting(sessionName, key, val),
    };

    if (COMMANDS[command]) {
      await COMMANDS[command](conn, m, args, ctx);
    } else {
      // Auto-reply check for unknown commands
      await handleAutoReply(conn, m, sessionName, body);
    }
  } catch (err) {
    process.stdout.write(`[CASE ERROR] ${err.message}\n`);
  }
}

// ─── Group Participants Update Handler (Welcome/Goodbye + AntiBot) ───────────
async function handleGroupUpdate(conn, update, sessionName) {
  try {
    const { id, participants, action } = update;
    if (!participants || !action) return;
    
    for (const user of participants) {
      // Welcome/Goodbye
      await handleWelcomeGoodbye(conn, id, user, action, sessionName);
      
      // Anti-Bot (only on add)
      if (action === 'add') {
        await handleAntiBot(conn, id, user, sessionName);
      }
    }
  } catch (e) {
    process.stdout.write(`[GROUP UPDATE ERR] ${e.message}\n`);
  }
}

module.exports = { 
  handleMessage, 
  handleDelete, 
  handleGroupUpdate,
  storeMsg, 
  COMMANDS, 
  COMMANDS_INFO 
};
