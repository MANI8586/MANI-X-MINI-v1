module.exports = {
  name: 'ai',
  aliases: ['ask', 'chatgpt', 'gpt'],
  description: 'ChatGPT se AI jawab lein',
  category: 'AI',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const query = args.join(' ');
    if (!query) return ctx.fReply(`❌ Usage: ${ctx.prefix}ai <your question>\nExample: ${ctx.prefix}ai What is the capital of Pakistan?`);
    
    await ctx.fReply('🤖 *Thinking...*');
    
    try {
      // Free ChatGPT API (gpt4free)
      const response = await fetch('https://api.yanz.xyz/api/ai/gpt4?query=' + encodeURIComponent(query));
      const data = await response.json();
      
      if (data && data.result) {
        await ctx.fReply(`🤖 *AI Response:*\n\n${data.result}`);
      } else {
        // Fallback API
        const res2 = await fetch('https://api.siputzx.my.id/api/ai/chatgpt?prompt=' + encodeURIComponent(query));
        const data2 = await res2.json();
        await ctx.fReply(`🤖 *AI Response:*\n\n${data2.data || 'No response'}`);
      }
    } catch (e) {
      await ctx.fReply('❌ AI service unavailable. Try again later.');
    }
  }
};
