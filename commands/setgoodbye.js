module.exports = {
  name: 'setgoodbye',
  aliases: ['goodbye', 'byemsg'],
  description: 'Group ke liye custom goodbye message set karein',
  category: 'Group',
  isOwner: false,
  isAdmin: true,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith('@g.us')) return ctx.fReply('❌ Only works in groups.');
    
    const message = args.join(' ');
    if (!message) {
      return ctx.fReply(
        `❌ Usage: ${ctx.prefix}setgoodbye <message>\n\n` +
        `*Variables:*\n` +
        `@user - Mention user\n` +
        `{name} - User name\n` +
        `{group} - Group name\n\n` +
        `Example: ${ctx.prefix}setgoodbye Goodbye @user! We'll miss you.`
      );
    }
    
    ctx.setSessionSetting(`goodbye_${remoteJid}`, message);
    await ctx.fReply(`✅ Goodbye message set for this group!`);
  }
};
