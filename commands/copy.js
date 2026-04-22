module.exports = {
  name: 'copy',
  aliases: ['cp', 'clone', 'dup'],
  description: 'Quoted message ko copy karein',
  category: 'Media',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const quotedMsg = ctx.getQuotedMsg();
    if (!quotedMsg) return ctx.fReply(`❌ Reply to a message with ${ctx.prefix}copy`);
    await conn.sendMessage(m.key.remoteJid, quotedMsg, { quoted: m });
  }
};
