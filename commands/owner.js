module.exports = {
  name: 'owner',
  aliases: ['dev', 'creator', 'founder'],
  description: 'Bot owner ka contact number dekhein',
  category: 'Info',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const us = ctx.loadUserSettings();
    const ownerNum = us.ownerNumber || ctx.botNumber;
    await conn.sendMessage(m.key.remoteJid, {
      text: `👑 *Bot Owner*\n\n📞 wa.me/${ownerNum}`,
      mentions: [`${ownerNum}@s.whatsapp.net`]
    }, { quoted: m });
  }
};
