module.exports = {
  name: 'autoreply',
  aliases: ['ar', 'autoresponder'],
  description: 'Specific keyword par auto-reply set karein',
  category: 'Auto',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const subCmd = (args[0] || '').toLowerCase();
    
    if (subCmd === 'add') {
      const keyword = args[1]?.toLowerCase();
      const reply = args.slice(2).join(' ');
      
      if (!keyword || !reply) {
        return ctx.fReply(`❌ Usage: ${ctx.prefix}autoreply add <keyword> <reply>\nExample: ${ctx.prefix}autoreply add hello Hi there!`);
      }
      
      let replies = ctx.getSessionSetting('autoreply', {});
      replies[keyword] = reply;
      ctx.setSessionSetting('autoreply', replies);
      
      await ctx.fReply(`✅ Auto-reply added!\nKeyword: "${keyword}"\nReply: "${reply}"`);
      
    } else if (subCmd === 'del' || subCmd === 'remove') {
      const keyword = args[1]?.toLowerCase();
      if (!keyword) return ctx.fReply(`❌ Usage: ${ctx.prefix}autoreply del <keyword>`);
      
      let replies = ctx.getSessionSetting('autoreply', {});
      if (replies[keyword]) {
        delete replies[keyword];
        ctx.setSessionSetting('autoreply', replies);
        await ctx.fReply(`✅ Auto-reply for "${keyword}" removed.`);
      } else {
        await ctx.fReply(`❌ Keyword "${keyword}" not found.`);
      }
      
    } else if (subCmd === 'list') {
      const replies = ctx.getSessionSetting('autoreply', {});
      const keywords = Object.keys(replies);
      
      if (keywords.length === 0) {
        await ctx.fReply('📭 No auto-replies set.');
      } else {
        let msg = '📋 *Auto-Reply List:*\n\n';
        keywords.forEach(k => msg += `• "${k}" → "${replies[k]}"\n`);
        await ctx.fReply(msg);
      }
      
    } else {
      await ctx.fReply(
        `❌ Usage:\n` +
        `${ctx.prefix}autoreply add <keyword> <reply>\n` +
        `${ctx.prefix}autoreply del <keyword>\n` +
        `${ctx.prefix}autoreply list`
      );
    }
  }
};
