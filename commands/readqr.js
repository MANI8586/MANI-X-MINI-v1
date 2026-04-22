module.exports = {
  name: 'readqr',
  aliases: ['scanqr', 'qrread'],
  description: 'QR code scan karein (image se)',
  category: 'Tools',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const quotedMsg = ctx.getQuotedMsg();
    const imageMsg = quotedMsg?.imageMessage || m.message?.imageMessage;
    
    if (!imageMsg) return ctx.fReply(`❌ Reply to an image with QR code or send an image.\nUsage: ${ctx.prefix}readqr`);
    
    await ctx.fReply('🔍 *Scanning QR code...*');
    
    try {
      const buffer = await ctx.downloadMedia(imageMsg, 'image');
      const base64 = buffer.toString('base64');
      
      const response = await fetch('https://api.yanz.xyz/api/tools/readqr?image=' + encodeURIComponent(base64));
      const data = await response.json();
      
      if (data && data.result) {
        await ctx.fReply(`✅ *QR Code Content:*\n\n${data.result}`);
      } else {
        await ctx.fReply('❌ No QR code found in the image.');
      }
    } catch (e) {
      await ctx.fReply('❌ Failed to scan QR code.');
    }
  }
};
