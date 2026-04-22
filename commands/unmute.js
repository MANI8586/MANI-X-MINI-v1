module.exports = {
  name: 'unmute',
  aliases: ['um', 'unsilent', 'speak'],
  description: 'Group unmute karein (sab messages bhej sakte hain)',
  category: 'Group',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return ctx.fReply('❌ This command only works in groups.');
    await conn.groupSettingUpdate(m.key.remoteJid, 'not_announcement');
    await ctx.fReply('🔊 Group unmuted. Everyone can send messages.');
  }
};
