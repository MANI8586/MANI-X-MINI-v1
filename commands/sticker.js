module.exports = {
  name: 'sticker',
  aliases: ['s', 'st', 'stik'],
  description: 'Image ya video ko sticker mein convert karein',
  category: 'Media',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    const quotedMsg = ctx.getQuotedMsg();

    let mediaSource = null;
    let mediaType = null;

    if (quotedMsg) {
      const t = ctx.getMediaType(quotedMsg);
      if (t && (t.type === 'image' || t.type === 'video')) {
        mediaSource = t.inner;
        mediaType = t.type;
      }
    }
    if (!mediaSource) {
      const t = ctx.getMediaType(m.message || {});
      if (t && (t.type === 'image' || t.type === 'video')) {
        mediaSource = t.inner;
        mediaType = t.type;
      }
    }

    if (!mediaSource) return ctx.fReply(`❌ Reply to an image or video with ${ctx.prefix}sticker`);

    try {
      const buf = await ctx.downloadMedia(mediaSource, mediaType);
      await conn.sendMessage(remoteJid, { sticker: buf }, { quoted: m });
    } catch (e) {
      await ctx.plainReply(`❌ Failed to create sticker: ${e.message}`);
    }
  }
};
