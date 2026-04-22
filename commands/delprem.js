const { delPremium } = require('../helper/function');

module.exports = {
  name: 'delprem',
  aliases: ['dp', 'delpremium', 'premdel'],
  description: 'Premium user remove karein',
  category: 'Premium',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    let target = ctx.resolveTarget();
    if (!target) return ctx.fReply(`❌ Usage: ${ctx.prefix}delprem <number>\nExample: ${ctx.prefix}delprem 923001234567`);
    target = target.replace(/[^0-9]/g, '');
    const result = delPremium(target);
    await ctx.fReply(result ? `✅ ${target} removed from premium.` : `⚠️ ${target} is not in premium list.`);
  }
};
