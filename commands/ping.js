module.exports = {
  name: 'ping',
  aliases: ['p', 'speed', 'test'],
  description: 'Bot ki response speed check karein',
  category: 'Info',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const start = Date.now();
    await conn.sendMessage(m.key.remoteJid, { text: '🏓 Pong!' }, { quoted: m });
    const ms = Date.now() - start;
    await ctx.fReply(`🏓 *Pong!*\n⚡ *Speed:* ${ms}ms`);
  }
};
