const { normalizeNumber } = require('../helper/function');

module.exports = {
  name: 'kick',
  aliases: ['remove', 'k', 'bye'],
  description: 'Member ko group se nikalein',
  category: 'Group',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ This command only works in groups.');

    const target = ctx.resolveTarget();
    if (!target) return ctx.fReply(`❌ Reply to a message, @mention, or provide number.\nUsage: ${ctx.prefix}kick @user`);
    const targetJid = target.includes('@') ? target : `${target.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const targetNum = normalizeNumber(targetJid);

    await conn.groupParticipantsUpdate(remoteJid, [targetJid], 'remove');
    await conn.sendMessage(remoteJid, {
      text: `🦵 @${targetNum} has been kicked from the group.`,
      mentions: [targetJid]
    }, { quoted: m });
  }
};
