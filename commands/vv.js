module.exports = {
  name: 'vv',
  aliases: ['save', 'done'],
  description: 'View Once message ko save/download karein',
  category: 'Media',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    const quotedMsg = ctx.getQuotedMsg();
    if (!quotedMsg) return ctx.fReply(`❌ Reply to a view-once message with ${ctx.prefix}vv`);

    const inner = quotedMsg?.viewOnceMessageV2?.message || quotedMsg?.viewOnceMessage?.message || quotedMsg;
    const t = ctx.getMediaType(inner);
    if (!t) return ctx.fReply('❌ No media found in quoted message.');

    try {
      const buf = await ctx.downloadMedia(t.inner, t.type);
      if (t.type === 'image') {
        await conn.sendMessage(remoteJid, { image: buf, caption: '👁️ View Once Revealed' }, { quoted: m });
      } else if (t.type === 'video') {
        await conn.sendMessage(remoteJid, { video: buf, caption: '👁️ View Once Revealed' }, { quoted: m });
      }
    } catch (e) {
      await ctx.plainReply(`❌ Failed: ${e.message}`);
    }
  }
};
