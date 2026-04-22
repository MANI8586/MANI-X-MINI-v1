module.exports = {
  name: 'video',
  aliases: ['ytv', 'ytmp4', 'ytvideo'],
  description: 'YouTube se video download karein',
  category: 'Downloader',
  isOwner: false,
  isAdmin: false,
  isPremium: true,
  run: async (conn, m, args, ctx) => {
    const query = args.join(' ');
    if (!query) return ctx.fReply(`❌ Usage: ${ctx.prefix}video <video name/url>\nExample: ${ctx.prefix}video https://youtu.be/xxx`);
    
    await ctx.fReply('🔍 *Searching...*');
    
    try {
      let url = query;
      if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
        const searchRes = await fetch('https://api.yanz.xyz/api/downloader/ytplay?query=' + encodeURIComponent(query));
        const searchData = await searchRes.json();
        if (!searchData || !searchData.url) return ctx.fReply('❌ Video not found.');
        url = searchData.url;
        await ctx.fReply(`🎬 *Found:* ${searchData.title}\n📥 *Downloading...*`);
      }
      
      const dlRes = await fetch('https://api.yanz.xyz/api/downloader/ytmp4?url=' + encodeURIComponent(url));
      const dlData = await dlRes.json();
      
      if (dlData && dlData.download) {
        await conn.sendMessage(m.key.remoteJid, {
          video: { url: dlData.download },
          caption: `🎬 ${dlData.title || 'YouTube Video'}`
        }, { quoted: m });
      } else {
        await ctx.fReply('❌ Download failed. Video might be too large.');
      }
    } catch (e) {
      await ctx.fReply('❌ Service unavailable.');
    }
  }
};
