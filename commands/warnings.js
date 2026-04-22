const fs = require('fs');
const path = require('path');

const warningsPath = path.join(__dirname, '../database/warnings.json');

module.exports = {
  name: 'warnings',
  aliases: ['checkwarn', 'mywarns', 'warnlist'],
  description: 'User ki warnings check karein',
  category: 'Protection',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ Only works in groups.');
    
    let targetJid = ctx.resolveTarget();
    if (!targetJid) targetJid = ctx.senderJid;
    if (typeof targetJid === 'string' && !targetJid.includes('@')) targetJid = `${targetJid.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    
    const warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
    const groupWarnings = warnings[remoteJid] || {};
    const userWarns = groupWarnings[targetJid];
    
    if (!userWarns || userWarns.count === 0) {
      return ctx.fReply(`✅ @${targetJid.split('@')[0]} has *0 warnings*`, { mentions: [targetJid] });
    }
    
    let msg = `⚠️ *Warnings for @${targetJid.split('@')[0]}*\n`;
    msg += `📊 *Count:* ${userWarns.count}/3\n\n`;
    msg += `*Reasons:*\n`;
    userWarns.reasons.forEach((r, i) => {
      msg += `${i + 1}. ${r.reason} (${new Date(r.date).toLocaleDateString()})\n`;
    });
    
    await conn.sendMessage(remoteJid, { text: msg, mentions: [targetJid] }, { quoted: m });
  }
};
