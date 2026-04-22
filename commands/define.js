module.exports = {
  name: 'define',
  aliases: ['dictionary', 'meaning', 'def'],
  description: 'Kisi word ka meaning batayein',
  category: 'Info',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const word = args.join(' ');
    if (!word) return ctx.fReply(`❌ Usage: ${ctx.prefix}define <word>\nExample: ${ctx.prefix}define beautiful`);
    
    try {
      const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word));
      const data = await response.json();
      
      if (data && data[0]) {
        const entry = data[0];
        let msg = `📖 *${entry.word}*\n\n`;
        
        entry.meanings.slice(0, 3).forEach((meaning, i) => {
          msg += `*${meaning.partOfSpeech}*\n`;
          meaning.definitions.slice(0, 2).forEach((def, j) => {
            msg += `${j + 1}. ${def.definition}\n`;
            if (def.example) msg += `   _Example:_ ${def.example}\n`;
          });
          msg += '\n';
        });
        
        await ctx.fReply(msg);
      } else {
        await ctx.fReply(`❌ No definition found for "${word}".`);
      }
    } catch (e) {
      await ctx.fReply('❌ Dictionary service unavailable.');
    }
  }
};
