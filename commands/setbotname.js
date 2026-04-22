module.exports = {
  name: 'setbotname',
  aliases: ['sbn', 'changebotname', 'botname'],
  description: 'Bot ka naam change karein',
  category: 'Settings',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const name = args.join(' ').trim();
    if (!name) return ctx.fReply(`❌ Usage: ${ctx.prefix}setbotname <name>\nExample: ${ctx.prefix}setbotname MANI X BOT`);
    ctx.setSessionSetting('botName', name);
    await ctx.fReply(`✅ Bot name set to: ${name}`);
  }
};
