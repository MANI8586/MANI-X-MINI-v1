module.exports = {
  name: 'setprefix',
  aliases: ['sp', 'changeprefix', 'prefix'],
  description: 'Bot ka command prefix change karein',
  category: 'Settings',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    if (!args[0]) return ctx.fReply(`❌ Usage: ${ctx.prefix}setprefix <symbol>\nExample: ${ctx.prefix}setprefix !`);
    ctx.setSessionSetting('prefix', args[0].trim());
    await ctx.fReply(`✅ Prefix changed to: ${args[0].trim()}`);
  }
};
