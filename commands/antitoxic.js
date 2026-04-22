module.exports = {
  name: 'antitoxic',
  aliases: ['nobadwords', 'wordfilter', 'antigali'],
  description: 'Gaali aur toxic words filter karein',
  category: 'Protection',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const option = (args[0] || '').toLowerCase();
    if (!['on', 'off', 'warn', 'kick', 'del'].includes(option)) {
      return ctx.fReply(`❌ Usage: ${ctx.prefix}antitoxic on/off/warn/kick/del`);
    }
    
    ctx.setSessionSetting('antitoxic', option);
    await ctx.fReply(`✅ Anti-Toxic set to: *${option.toUpperCase()}*`);
  }
};

// Bad words list (settings.js mein add karein)
const BAD_WORDS = [
  'gali1', 'gali2', 'gaali', 'badword',
  'fuck', 'shit', 'asshole', 'bitch','gando','mkc','bkc','koni','harami','chut','gand','lun' 
// Add more bad words
];
