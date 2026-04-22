module.exports = {
  name: 'autolikestatus',
  aliases: ['als', 'likestatus', 'autolike'],
  description: 'WhatsApp status auto-like on/off karein',
  category: 'Auto',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const next = !ctx.getSessionSetting('autoLikeStatus', false);
    ctx.setSessionSetting('autoLikeStatus', next);
    await ctx.fReply(`✅ Auto Like Status: *${next ? 'ON' : 'OFF'}*`);
  }
};
