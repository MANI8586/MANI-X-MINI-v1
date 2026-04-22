module.exports = {
  name: 'add',
  aliases: ['invite', 'a'],
  description: 'Naya member group mein add karein',
  category: 'Group',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ This command only works in groups.');
    
    let target = (args[0] || '').replace(/[^0-9]/g, '');
    if (!target) return ctx.fReply(`❌ Usage: ${ctx.prefix}add <number>\nExample: ${ctx.prefix}add 923001234567`);
    
    await conn.groupParticipantsUpdate(remoteJid, [`${target}@s.whatsapp.net`], 'add');
    await ctx.fReply(`✅ ${target} added to group.`);
  }
};
