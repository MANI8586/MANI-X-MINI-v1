const { normalizeNumber } = require('../helper/function');

module.exports = {
  name: 'groupinfo',
  aliases: ['gi', 'ginfo', 'groupdata'],
  description: 'Group ki maloomat dekhein',
  category: 'Group',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ This command only works in groups.');
    
    const meta = await conn.groupMetadata(remoteJid);
    const admins = meta.participants.filter(p => p.admin).map(p => normalizeNumber(p.id)).join(', ');
    const created = new Date(meta.creation * 1000).toLocaleDateString('en-GB');
    
    await ctx.fReply(
      `📋 *Group Info*\n\n` +
      `🏷️ *Name:* ${meta.subject}\n` +
      `📝 *Description:* ${meta.desc || 'None'}\n` +
      `👑 *Owner:* ${normalizeNumber(meta.owner)}\n` +
      `👥 *Members:* ${meta.participants.length}\n` +
      `👮 *Admins:* ${admins || 'None'}\n` +
      `📅 *Created:* ${created}`
    );
  }
};
