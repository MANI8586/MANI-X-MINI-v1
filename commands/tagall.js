const { normalizeNumber } = require('../helper/function');

module.exports = {
  name: 'tagall',
  aliases: ['ta', 'everyone', 'all', 'tag'],
  description: 'Group ke sab members ko tag karein',
  category: 'Group',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ This command only works in groups.');
    
    const meta = await conn.groupMetadata(remoteJid);
    const members = meta.participants.map(p => p.id);
    const message = args.join(' ') || 'Attention everyone!';
    const text = `📢 *${message}*\n\n` + members.map(id => `@${normalizeNumber(id)}`).join(' ');
    
    await conn.sendMessage(remoteJid, { text, mentions: members }, { quoted: m });
  }
};
