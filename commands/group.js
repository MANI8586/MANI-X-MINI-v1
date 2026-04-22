module.exports = {
  name: 'group',
  aliases: ['g', 'gc', 'groupmode'],
  description: 'Group ko open ya close karein',
  category: 'Group',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ This command only works in groups.');
    
    const option = (args[0] || '').toLowerCase();
    if (option === 'open') {
      await conn.groupSettingUpdate(remoteJid, 'not_announcement');
      await ctx.fReply('✅ Group opened. Everyone can send messages.');
    } else if (option === 'close') {
      await conn.groupSettingUpdate(remoteJid, 'announcement');
      await ctx.fReply('✅ Group closed. Only admins can send messages.');
    } else {
      await ctx.fReply(`❌ Usage: ${ctx.prefix}group open/close`);
    }
  }
};
