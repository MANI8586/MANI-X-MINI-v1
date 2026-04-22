const bannedUsers = new Set();

module.exports = {
  name: 'ban',
  aliases: ['block', 'banuser'],
  description: 'User ko bot use karne se ban karein',
  category: 'Ban',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    let target = ctx.resolveTarget();
    if (!target) return ctx.fReply(`❌ Usage: ${ctx.prefix}ban <number>\nExample: ${ctx.prefix}ban 923001234567`);
    target = target.replace(/[^0-9]/g, '');
    bannedUsers.add(target);
    await ctx.fReply(`✅ ${target} has been banned.`);
  }
};
