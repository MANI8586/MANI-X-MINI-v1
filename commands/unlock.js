module.exports = {
  name: 'unlock',
  aliases: ['unlockcmd', 'enable'],
  description: 'Group mein locked command unlock karein',
  category: 'Protection',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ Only works in groups.');
    
    const cmd = (args[0] || '').toLowerCase();
    if (!cmd) return ctx.fReply(`❌ Usage: ${ctx.prefix}unlock <command>\nExample: ${ctx.prefix}unlock sticker`);
    
    let locked = ctx.getSessionSetting('lockedCommands', []);
    const index = locked.indexOf(cmd);
    if (index > -1) {
      locked.splice(index, 1);
      ctx.setSessionSetting('lockedCommands', locked);
      await ctx.fReply(`🔓 Command *${ctx.prefix}${cmd}* has been unlocked.`);
    } else {
      await ctx.fReply(`⚠️ Command *${ctx.prefix}${cmd}* is not locked.`);
    }
  }
};
