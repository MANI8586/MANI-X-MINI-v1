const os = require('os');
const { formatUptime } = require('../helper/utils');

module.exports = {
  name: 'runtime',
  aliases: ['rt', 'status', 'stats'],
  description: 'System info aur bot ka runtime dekhein',
  category: 'Info',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const mem = process.memoryUsage();
    const uptime = formatUptime(Date.now() - global.botStartTime);
    await ctx.fReply(
      `🖥️ *System Info*\n\n` +
      `⏱️ *Uptime:* ${uptime}\n` +
      `💾 *RAM:* ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
      `💻 *Platform:* ${os.platform()}\n` +
      `🔢 *Node.js:* ${process.version}`
    );
  }
};
