const { formatUptime } = require('../helper/utils');

module.exports = {
  name: 'uptime',
  aliases: ['up', 'time', 'online'],
  description: 'Bot kitni der se online hai',
  category: 'Info',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const uptime = formatUptime(Date.now() - global.botStartTime);
    await ctx.fReply(`⏱️ *Uptime:* ${uptime}`);
  }
};
