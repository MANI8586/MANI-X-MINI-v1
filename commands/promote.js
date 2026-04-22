const { normalizeNumber } = require('../helper/function');

module.exports = {
  name: 'promote',
  aliases: ['prom', 'admin', 'makeadmin'],
  description: 'Group member ko admin banayein',
  category: 'Group',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ This command only works in groups.');

    const target = ctx.resolveTarget();
    if (!target) return ctx.fReply(`❌ Reply to a message, @mention, or provide number.\nUsage: ${ctx.prefix}promote @user`);
    const targetJid = target.includes('@') ? target : `${target.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const targetNum = normalizeNumber(targetJid);

    await conn.groupParticipantsUpdate(remoteJid, [targetJid], 'promote');
    await conn.sendMessage(remoteJid, {
      text: `👑 @${targetNum} has been promoted to admin!`,
      mentions: [targetJid]
    }, { quoted: m });
  }
};
