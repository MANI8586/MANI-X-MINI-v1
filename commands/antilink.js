module.exports = {
  name: 'antilink',
  aliases: ['al', 'linkprotect', 'nolink'],
  description: 'Group mein link bhejne par action set karein',
  category: 'Auto',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const option = (args[0] || '').toLowerCase();
    if (!['off', 'del', 'warn', 'kick'].includes(option)) {
      return ctx.fReply(`❌ Usage: ${ctx.prefix}antilink off/del/warn/kick`);
    }
    ctx.setSessionSetting('antilink', option);
    await ctx.fReply(`✅ Antilink set to: *${option.toUpperCase()}*`);
  }
};
