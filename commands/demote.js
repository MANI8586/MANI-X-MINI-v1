const { normalizeNumber } = require('../helper/function');

module.exports = {
  name: 'demote',
  aliases: ['dem', 'unadmin', 'removeadmin'],
  description: 'Group admin ko member banayein',
  category: 'Group',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ This command only works in groups.');

    const target = ctx.resolveTarget();
    if (!target) return ctx.fReply(`❌ Reply to a message, @mention, or provide number.\nUsage: ${ctx.prefix}demote @admin`);
    const targetJid = target.includes('@') ? target : `${target.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const targetNum = normalizeNumber(targetJid);

    await conn.groupParticipantsUpdate(remoteJid, [targetJid], 'demote');
    await conn.sendMessage(remoteJid, {
      text: `⬇️ @${targetNum} has been demoted from admin.`,
      mentions: [targetJid]
    }, { quoted: m });
  }
};
