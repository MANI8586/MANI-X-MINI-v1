module.exports = {
  name: 'tts',
  aliases: ['speak', 'voice'],
  description: 'Text ko voice message mein convert karein',
  category: 'AI',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const text = args.join(' ');
    if (!text) return ctx.fReply(`❌ Usage: ${ctx.prefix}tts <text>\nExample: ${ctx.prefix}tts Hello World`);
    
    // Language options: en, hi, ur, ar, etc.
    const lang = args[0]?.length === 2 ? args[0] : 'en';
    const speechText = lang.length === 2 ? args.slice(1).join(' ') : text;
    
    if (!speechText) return ctx.fReply(`❌ Usage: ${ctx.prefix}tts [lang] <text>\nExample: ${ctx.prefix}tts ur السلام علیکم`);
    
    await ctx.fReply('🔊 *Generating voice...*');
    
    try {
      const url = `https://api.yanz.xyz/api/ai/tts?text=${encodeURIComponent(speechText)}&lang=${lang}`;
      await conn.sendMessage(m.key.remoteJid, { 
        audio: { url }, 
        mimetype: 'audio/mp4',
        ptt: true 
      }, { quoted: m });
    } catch (e) {
      await ctx.fReply('❌ TTS service unavailable.');
    }
  }
};
