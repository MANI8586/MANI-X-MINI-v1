module.exports = {
  name: 'setmenuimg',
  aliases: ['smi','setbotimage', 'setmenuimage','menuimage', 'changemenuimg'],
  description: 'Menu ki image change karein',
  category: 'Settings',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const imgUrl = args[0];
    if (!imgUrl) return ctx.fReply(`❌ Usage: ${ctx.prefix}setmenuimg <url>\nExample: ${ctx.prefix}setmenuimg https://i.imgur.com/xxx.jpg`);
    ctx.setSessionSetting('menuImage', imgUrl);
    await ctx.fReply(`✅ Menu image updated.`);
  }
};
