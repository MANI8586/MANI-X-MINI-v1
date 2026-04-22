module.exports = {
  name: 'autosticker',
  aliases: ['as', 'autostik'],
  description: 'Image bhejne par auto-sticker banaye',
  category: 'Auto',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const option = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(option)) {
      return ctx.fReply(`❌ Usage: ${ctx.prefix}autosticker on/off`);
    }
    
    ctx.setSessionSetting('autosticker', option === 'on');
    await ctx.fReply(`✅ Auto-Sticker: *${option.toUpperCase()}*`);
  }
};
