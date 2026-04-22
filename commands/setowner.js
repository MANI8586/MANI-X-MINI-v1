module.exports = {
  name: 'setowner',
  aliases: ['so', 'changeowner'],
  description: 'Bot ka owner number change karein',
  category: 'Settings',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    let target = ctx.resolveTarget();
    if (!target) return ctx.fReply(`❌ Usage: ${ctx.prefix}setowner <number>\nExample: ${ctx.prefix}setowner 923001234567`);
    target = target.replace(/[^0-9]/g, '');
    ctx.setSessionSetting('ownerNumber', target);
    await ctx.fReply(`✅ Owner set to: ${target}`);
  }
};
