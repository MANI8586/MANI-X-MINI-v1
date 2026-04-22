module.exports = {
  name: 'antibot',
  aliases: ['nobot', 'antibots'],
  description: 'Doosre bots ko group se auto-kick karein',
  category: 'Protection',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const option = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(option)) {
      return ctx.fReply(`❌ Usage: ${ctx.prefix}antibot on/off`);
    }
    
    ctx.setSessionSetting('antibot', option === 'on');
    await ctx.fReply(`✅ Anti-Bot: *${option.toUpperCase()}*`);
  }
};

// Anti-Bot detection function (case.js mein add karna hai)
// Jab koi naya member join kare to check karein
async function checkAndKickBot(conn, groupJid, userJid) {
  // Common bot numbers ya patterns
  const botPatterns = ['bot', 'assistant', 'ai'];
  // Agar user ka naam bot pattern match kare to kick
  // Yeh function group participants update event mein call hoga
}
