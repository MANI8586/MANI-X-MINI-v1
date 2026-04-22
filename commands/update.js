const { exec } = require('child_process');

module.exports = {
  name: 'update',
  aliases: ['gitpull', 'pull', 'upgrade'],
  description: 'GitHub se latest code pull karein',
  category: 'Owner',
  isOwner: true,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    await ctx.fReply('🔄 *Updating bot...*');
    
    exec('git pull', (error, stdout, stderr) => {
      if (error) {
        return ctx.fReply(`❌ Update failed:\n${error.message}`);
      }
      if (stderr) {
        return ctx.fReply(`⚠️ Update warning:\n${stderr}`);
      }
      
      ctx.fReply(`✅ *Bot Updated!*\n\n${stdout || 'Already up to date.'}`);
      
      // Optional: Restart bot after update
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    });
  }
};
