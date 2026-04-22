module.exports = {
  name: 'public',
  aliases: ['pub', 'publicmode'],
  description: 'Bot ko public mode mein karein (sab use kar sakte hain)',
  category: 'Settings',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    ctx.setSessionSetting('mode', 'public');
    await ctx.fReply('✅ Bot set to *public mode*. Everyone can use commands.');
  }
};
