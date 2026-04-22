const fs = require('fs');
const path = require('path');

const warningsPath = path.join(__dirname, '../database/warnings.json');
if (!fs.existsSync(warningsPath)) fs.writeFileSync(warningsPath, '{}');

function getWarnings() {
  return JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
}

function saveWarnings(data) {
  fs.writeFileSync(warningsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'warn',
  aliases: ['warning', 'givewarn'],
  description: 'User ko warning dein (3 warnings = kick)',
  category: 'Protection',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ Only works in groups.');
    
    const target = ctx.resolveTarget();
    if (!target) return ctx.fReply(`❌ Reply/@mention user or provide number.\nUsage: ${ctx.prefix}warn @user [reason]`);
    
    const targetJid = target.includes('@') ? target : `${target.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    const warnings = getWarnings();
    const groupId = remoteJid;
    
    if (!warnings[groupId]) warnings[groupId] = {};
    if (!warnings[groupId][targetJid]) warnings[groupId][targetJid] = { count: 0, reasons: [] };
    
    warnings[groupId][targetJid].count++;
    warnings[groupId][targetJid].reasons.push({ reason, date: new Date().toISOString() });
    saveWarnings(warnings);
    
    const warnCount = warnings[groupId][targetJid].count;
    let action = '';
    
    if (warnCount >= 3) {
      try {
        await conn.groupParticipantsUpdate(remoteJid, [targetJid], 'remove');
        action = '\n\n🚫 *User kicked (3 warnings reached)*';
        delete warnings[groupId][targetJid];
        saveWarnings(warnings);
      } catch (e) {
        action = '\n\n⚠️ Failed to kick user.';
      }
    }
    
    await ctx.fReply(
      `⚠️ *Warning ${warnCount}/3*\n` +
      `👤 @${targetJid.split('@')[0]}\n` +
      `📝 *Reason:* ${reason}${action}`,
      { mentions: [targetJid] }
    );
  }
};
