const bannedUsers = new Set();

module.exports = {
  name: 'unban',
  aliases: ['unblock', 'unbanuser'],
  description: 'User ko unban karein',
  category: 'Ban',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    let target = ctx.resolveTarget();
    if (!target) return ctx.fReply(`❌ Usage: ${ctx.prefix}unban <number>\nExample: ${ctx.prefix}unban 923001234567`);
    target = target.replace(/[^0-9]/g, '');
    bannedUsers.delete(target);
    await ctx.fReply(`✅ ${target} has been unbanned.`);
  }
};
