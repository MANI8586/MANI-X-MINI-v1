const fs = require('fs');
const path = require('path');

const warningsPath = path.join(__dirname, '../database/warnings.json');

module.exports = {
  name: 'resetwarn',
  aliases: ['clearwarn', 'delwarn'],
  description: 'User ki warnings reset karein',
  category: 'Protection',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ Only works in groups.');
    
    const target = ctx.resolveTarget();
    if (!target) return ctx.fReply(`❌ Reply/@mention user or provide number.\nUsage: ${ctx.prefix}resetwarn @user`);
    
    const targetJid = target.includes('@') ? target : `${target.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    
    const warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
    
    if (warnings[remoteJid] && warnings[remoteJid][targetJid]) {
      delete warnings[remoteJid][targetJid];
      fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
      await ctx.fReply(`✅ Warnings reset for @${targetJid.split('@')[0]}`, { mentions: [targetJid] });
    } else {
      await ctx.fReply(`⚠️ No warnings found for this user.`);
    }
  }
};
