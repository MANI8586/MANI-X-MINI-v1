module.exports = {
  name: 'setwelcome',
  aliases: ['welcome', 'welcomemsg'],
  description: 'Group ke liye custom welcome message set karein',
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
        `❌ Usage: ${ctx.prefix}setwelcome <message>\n\n` +
        `*Variables:*\n` +
        `@user - Mention user\n` +
        `{name} - User name\n` +
        `{group} - Group name\n` +
        `{count} - Member count\n\n` +
        `Example: ${ctx.prefix}setwelcome Welcome @user to {group}!`
      );
    }
    
    ctx.setSessionSetting(`welcome_${remoteJid}`, message);
    await ctx.fReply(`✅ Welcome message set for this group!`);
  }
};

// Welcome handler (case.js ya index.js mein add karein)
async function handleWelcome(conn, groupJid, userJid, action) {
  if (action !== 'add') return;
  
  const sessionName = getSessionNameFromJid(groupJid);
  const welcomeMsg = getSessionSetting(sessionName, `welcome_${groupJid}`, null);
  
  if (!welcomeMsg) return;
  
  const groupMeta = await conn.groupMetadata(groupJid);
  const groupName = groupMeta.subject;
  const memberCount = groupMeta.participants.length;
  
  let msg = welcomeMsg
    .replace(/{name}/g, `@${userJid.split('@')[0]}`)
    .replace(/{group}/g, groupName)
    .replace(/{count}/g, memberCount);
  
  await conn.sendMessage(groupJid, { 
    text: msg, 
    mentions: [userJid] 
  });
}
