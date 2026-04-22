module.exports = {
  name: 'lock',
  aliases: ['lockcmd', 'disable'],
  description: 'Group mein specific command lock karein',
  category: 'Protection',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ Only works in groups.');
    
    const cmd = (args[0] || '').toLowerCase();
    if (!cmd) return ctx.fReply(`❌ Usage: ${ctx.prefix}lock <command>\nExample: ${ctx.prefix}lock sticker`);
    
    let locked = ctx.getSessionSetting('lockedCommands', []);
    if (!locked.includes(cmd)) {
      locked.push(cmd);
      ctx.setSessionSetting('lockedCommands', locked);
      await ctx.fReply(`🔒 Command *${ctx.prefix}${cmd}* has been locked.`);
    } else {
      await ctx.fReply(`⚠️ Command *${ctx.prefix}${cmd}* is already locked.`);
    }
  }
};
