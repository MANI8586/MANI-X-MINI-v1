module.exports = {
  name: 'tiktok',
  aliases: ['tt', 'tk', 'tiktokdl'],
  description: 'TikTok video download karein (without watermark)',
  category: 'Downloader',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const url = args[0];
    if (!url) return ctx.fReply(`❌ Usage: ${ctx.prefix}tiktok <tiktok url>\nExample: ${ctx.prefix}tiktok https://vt.tiktok.com/xxx`);
    
    if (!url.includes('tiktok.com')) return ctx.fReply('❌ Please provide a valid TikTok URL.');
    
    await ctx.fReply('📥 *Downloading...*');
    
    try {
      const response = await fetch('https://api.yanz.xyz/api/downloader/tiktok?url=' + encodeURIComponent(url));
      const data = await response.json();
      
      if (data && data.video) {
        await conn.sendMessage(m.key.remoteJid, { 
          video: { url: data.video }, 
          caption: `🎵 ${data.title || 'TikTok Video'}\n👤 ${data.author || 'Unknown'}` 
        }, { quoted: m });
      } else {
        await ctx.fReply('❌ Failed to download.');
      }
    } catch (e) {
      await ctx.fReply('❌ Service unavailable.');
    }
  }
};
