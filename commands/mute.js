module.exports = {
  name: 'mute',
  aliases: ['m', 'silent', 'shutup'],
  description: 'Group mute karein (sirf admins messages bhej sakte hain)',
  category: 'Group',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return ctx.fReply('❌ This command only works in groups.');
    await conn.groupSettingUpdate(m.key.remoteJid, 'announcement');
    await ctx.fReply('🔇 Group muted. Only admins can send messages.');
  }
};
