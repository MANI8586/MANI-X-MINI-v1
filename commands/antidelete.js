module.exports = {
  name: 'antidelete',
  aliases: ['ad', 'antidel', 'deletemsg'],
  description: 'Deleted messages wapas bhejne ka feature on/off karein',
  category: 'Auto',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const next = !ctx.getSessionSetting('antidelete', false);
    ctx.setSessionSetting('antidelete', next);
    await ctx.fReply(`✅ Antidelete: *${next ? 'ON' : 'OFF'}*`);
  }
};
