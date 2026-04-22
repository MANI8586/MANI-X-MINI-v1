module.exports = {
  name: 'autoviewstatus',
  aliases: ['avs', 'viewstatus', 'autoview'],
  description: 'WhatsApp status auto-view on/off karein',
  category: 'Auto',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const next = !ctx.getSessionSetting('autoViewStatus', false);
    ctx.setSessionSetting('autoViewStatus', next);
    await ctx.fReply(`✅ Auto View Status: *${next ? 'ON' : 'OFF'}*`);
  }
};
