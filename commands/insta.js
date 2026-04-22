module.exports = {
  name: 'insta',
  aliases: ['ig', 'instagram', 'reel'],
  description: 'Instagram post/reel download karein',
  category: 'Downloader',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const url = args[0];
    if (!url) return ctx.fReply(`❌ Usage: ${ctx.prefix}insta <instagram url>\nExample: ${ctx.prefix}insta https://www.instagram.com/reel/xxx`);
    
    if (!url.includes('instagram.com')) return ctx.fReply('❌ Please provide a valid Instagram URL.');
    
    await ctx.fReply('📥 *Downloading...*');
    
    try {
      const response = await fetch('https://api.yanz.xyz/api/downloader/instagram?url=' + encodeURIComponent(url));
      const data = await response.json();
      
      if (data && data.url) {
        const isVideo = data.url.includes('.mp4');
        if (isVideo) {
          await conn.sendMessage(m.key.remoteJid, { video: { url: data.url }, caption: '📸 Instagram Reel' }, { quoted: m });
        } else {
          await conn.sendMessage(m.key.remoteJid, { image: { url: data.url }, caption: '📸 Instagram Post' }, { quoted: m });
        }
      } else {
        await ctx.fReply('❌ Failed to download. Make sure the post is public.');
      }
    } catch (e) {
      await ctx.fReply('❌ Service unavailable.');
    }
  }
};
