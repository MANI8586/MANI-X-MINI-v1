module.exports = {
  name: 'self',
  aliases: ['selfmode','onlyme'],
  description: 'Bot ko self mode mein karein (sirf owner use kar sakta hai)',
  category: 'Settings',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    ctx.setSessionSetting('mode', 'self');
    await ctx.fReply('✅ Bot set to *self mode*. Only owner can use commands.');
  }
};
