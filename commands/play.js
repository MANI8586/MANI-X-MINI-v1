module.exports = {
  name: 'play',
  aliases: ['yt', 'song', 'ytaudio'],
  description: 'YouTube se audio download karein',
  category: 'Downloader',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const query = args.join(' ');
    if (!query) return ctx.fReply(`❌ Usage: ${ctx.prefix}play <song name>\nExample: ${ctx.prefix}play Blinding Lights`);
    
    await ctx.fReply('🔍 *Searching...*');
    
    try {
      // Search YouTube
      const searchRes = await fetch('https://api.yanz.xyz/api/downloader/ytplay?query=' + encodeURIComponent(query));
      const searchData = await searchRes.json();
      
      if (!searchData || !searchData.url) {
        return ctx.fReply('❌ Song not found.');
      }
      
      await ctx.fReply(`🎵 *Found:* ${searchData.title}\n⏱️ *Duration:* ${searchData.duration}\n📥 *Downloading...*`);
      
      // Download audio
      const dlRes = await fetch('https://api.yanz.xyz/api/downloader/ytmp3?url=' + encodeURIComponent(searchData.url));
      const dlData = await dlRes.json();
      
      if (dlData && dlData.download) {
        await conn.sendMessage(m.key.remoteJid, {
          audio: { url: dlData.download },
          mimetype: 'audio/mp4',
          fileName: `${searchData.title}.mp3`
        }, { quoted: m });
      } else {
        await ctx.fReply('❌ Download failed.');
      }
    } catch (e) {
      await ctx.fReply('❌ Service unavailable.');
    }
  }
};
