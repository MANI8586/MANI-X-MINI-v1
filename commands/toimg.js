module.exports = {
  name: 'toimg',
  aliases: ['ti', 'imagify', 'stickertoimg'],
  description: 'Sticker ko image mein convert karein',
  category: 'Media',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    const quotedMsg = ctx.getQuotedMsg();
    const stickerObj = quotedMsg?.stickerMessage || m.message?.stickerMessage;
    if (!stickerObj) return ctx.fReply(`❌ Reply to a sticker with ${ctx.prefix}toimg`);

    try {
      const buf = await ctx.downloadMedia(stickerObj, 'sticker');
      await conn.sendMessage(remoteJid, { image: buf, caption: '🖼️ Converted from sticker' }, { quoted: m });
    } catch (e) {
      await ctx.plainReply(`❌ Failed: ${e.message}`);
    }
  }
};
