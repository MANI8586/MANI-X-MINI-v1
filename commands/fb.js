module.exports = {
  name: 'fb',
  aliases: ['facebook', 'fbdl'],
  description: 'Facebook video download karein',
  category: 'Downloader',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const url = args[0];
    if (!url) return ctx.fReply(`❌ Usage: ${ctx.prefix}fb <facebook url>\nExample: ${ctx.prefix}fb https://fb.watch/xxx`);
    
    if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
      return ctx.fReply('❌ Please provide a valid Facebook URL.');
    }
    
    await ctx.fReply('📥 *Downloading...*');
    
    try {
      const response = await fetch('https://api.yanz.xyz/api/downloader/facebook?url=' + encodeURIComponent(url));
      const data = await response.json();
      
      if (data && data.hd) {
        await conn.sendMessage(m.key.remoteJid, { 
          video: { url: data.hd }, 
          caption: '📘 Facebook Video' 
        }, { quoted: m });
      } else if (data && data.sd) {
        await conn.sendMessage(m.key.remoteJid, { 
          video: { url: data.sd }, 
          caption: '📘 Facebook Video (SD)' 
        }, { quoted: m });
      } else {
        await ctx.fReply('❌ Failed to download.');
      }
    } catch (e) {
      await ctx.fReply('❌ Service unavailable.');
    }
  }
};
