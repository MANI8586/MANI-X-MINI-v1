const { applyFont, FONT_COUNT } = require('../helper/fonts');

module.exports = {
  name: 'setfonts',
  aliases: ['sf', 'changefont', 'fontstyle'],
  description: 'Bot ka text font style change karein',
  category: 'Settings',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const num = parseInt(args[0]);
    if (!num || num < 1 || num > FONT_COUNT) {
      return ctx.plainReply(
        `❌ Usage: ${ctx.prefix}setfonts <1-${FONT_COUNT}>\n\n` +
        `Use ${ctx.prefix}fonts to preview all styles.`
      );
    }
    ctx.setSessionSetting('font', num);
    const sample = num > 1 ? applyFont('✅ Font active! Hello World 123', num) : '✅ Font active! Hello World 123 (Normal)';
    await conn.sendMessage(m.key.remoteJid, { text: sample }, { quoted: m });
  }
};
