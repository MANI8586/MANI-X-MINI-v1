module.exports = {
  name: 'wiki',
  aliases: ['wikipedia', 'wikisearch'],
  description: 'Wikipedia se information search karein',
  category: 'Info',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const query = args.join(' ');
    if (!query) return ctx.fReply(`❌ Usage: ${ctx.prefix}wiki <search term>\nExample: ${ctx.prefix}wiki Pakistan`);
    
    try {
      // Search
      const searchRes = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(query));
      const data = await searchRes.json();
      
      if (data && data.extract) {
        let msg = `📚 *${data.title}*\n\n`;
        msg += data.extract.substring(0, 1000) + '...\n\n';
        msg += `🔗 *Read more:* ${data.content_urls?.desktop?.page || 'https://en.wikipedia.org/wiki/' + encodeURIComponent(query)}`;
        
        if (data.thumbnail) {
          await conn.sendMessage(m.key.remoteJid, { 
            image: { url: data.thumbnail.source }, 
            caption: msg 
          }, { quoted: m });
        } else {
          await ctx.fReply(msg);
        }
      } else {
        await ctx.fReply(`❌ No results found for "${query}".`);
      }
    } catch (e) {
      await ctx.fReply('❌ Wikipedia service unavailable.');
    }
  }
};
