const { addPremium } = require('../helper/function');

module.exports = {
  name: 'addprem',
  aliases: ['ap', 'addpremium', 'premadd'],
  description: 'Premium user add karein',
  category: 'Premium',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    let target = ctx.resolveTarget();
    if (!target) return ctx.fReply(`❌ Usage: ${ctx.prefix}addprem <number>\nExample: ${ctx.prefix}addprem 923001234567`);
    target = target.replace(/[^0-9]/g, '');
    const result = addPremium(target);
    await ctx.fReply(result ? `✅ ${target} added as premium user.` : `⚠️ ${target} is already premium.`);
  }
};
