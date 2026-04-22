module.exports = {
  name: 'fancy',
  aliases: ['style', 'fontgen', 'fancytext'],
  description: 'Text ko multiple fancy styles mein convert karein',
  category: 'Fun',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const text = args.join(' ');
    if (!text) return ctx.fReply(`❌ Usage: ${ctx.prefix}fancy <text>\nExample: ${ctx.prefix}fancy Hello World`);
    
    const styles = {
      '𝓢𝓬𝓻𝓲𝓹𝓽': text.split('').map(c => {
        const map = { A:'𝒜', B:'𝐵', C:'𝒞', D:'𝒟', E:'𝐸', F:'𝐹', G:'𝒢', H:'𝐻', I:'𝐼', J:'𝒥', K:'𝒦', L:'𝐿', M:'𝑀', N:'𝒩', O:'𝒪', P:'𝒫', Q:'𝒬', R:'𝑅', S:'𝒮', T:'𝒯', U:'𝒰', V:'𝒱', W:'𝒲', X:'𝒳', Y:'𝒴', Z:'𝒵', a:'𝒶', b:'𝒷', c:'𝒸', d:'𝒹', e:'𝑒', f:'𝒻', g:'𝑔', h:'𝒽', i:'𝒾', j:'𝒿', k:'𝓀', l:'𝓁', m:'𝓂', n:'𝓃', o:'𝑜', p:'𝓅', q:'𝓆', r:'𝓇', s:'𝓈', t:'𝓉', u:'𝓊', v:'𝓋', w:'𝓌', x:'𝓍', y:'𝓎', z:'𝓏' };
        return map[c] || c;
      }).join(''),
      
      '𝗕𝗼𝗹𝗱': text.split('').map(c => {
        const map = { A:'𝗔', B:'𝗕', C:'𝗖', D:'𝗗', E:'𝗘', F:'𝗙', G:'𝗚', H:'𝗛', I:'𝗜', J:'𝗝', K:'𝗞', L:'𝗟', M:'𝗠', N:'𝗡', O:'𝗢', P:'𝗣', Q:'𝗤', R:'𝗥', S:'𝗦', T:'𝗧', U:'𝗨', V:'𝗩', W:'𝗪', X:'𝗫', Y:'𝗬', Z:'𝗭', a:'𝗮', b:'𝗯', c:'𝗰', d:'𝗱', e:'𝗲', f:'𝗳', g:'𝗴', h:'𝗵', i:'𝗶', j:'𝗷', k:'𝗸', l:'𝗹', m:'𝗺', n:'𝗻', o:'𝗼', p:'𝗽', q:'𝗾', r:'𝗿', s:'𝘀', t:'𝘁', u:'𝘂', v:'𝘃', w:'𝘄', x:'𝘅', y:'𝘆', z:'𝘇' };
        return map[c] || c;
      }).join(''),
      
      '𝕯𝖔𝖚𝖇𝖑𝖊': text.split('').map(c => {
        const map = { A:'𝔄', B:'𝔅', C:'ℭ', D:'𝔇', E:'𝔈', F:'𝔉', G:'𝔊', H:'ℌ', I:'ℑ', J:'𝔍', K:'𝔎', L:'𝔏', M:'𝔐', N:'𝔑', O:'𝔒', P:'𝔓', Q:'𝔔', R:'ℜ', S:'𝔖', T:'𝔗', U:'𝔘', V:'𝔙', W:'𝔚', X:'𝔛', Y:'𝔜', Z:'ℨ', a:'𝔞', b:'𝔟', c:'𝔠', d:'𝔡', e:'𝔢', f:'𝔣', g:'𝔤', h:'𝔥', i:'𝔦', j:'𝔧', k:'𝔨', l:'𝔩', m:'𝔪', n:'𝔫', o:'𝔬', p:'𝔭', q:'𝔮', r:'𝔯', s:'𝔰', t:'𝔱', u:'𝔲', v:'𝔳', w:'𝔴', x:'𝔵', y:'𝔶', z:'𝔷' };
        return map[c] || c;
      }).join(''),
      
      '𝙼𝚘𝚗𝚘': text.split('').map(c => {
        const map = { A:'𝙰', B:'𝙱', C:'𝙲', D:'𝙳', E:'𝙴', F:'𝙵', G:'𝙶', H:'𝙷', I:'𝙸', J:'𝙹', K:'𝙺', L:'𝙻', M:'𝙼', N:'𝙽', O:'𝙾', P:'𝙿', Q:'𝚀', R:'𝚁', S:'𝚂', T:'𝚃', U:'𝚄', V:'𝚅', W:'𝚆', X:'𝚇', Y:'𝚈', Z:'𝚉', a:'𝚊', b:'𝚋', c:'𝚌', d:'𝚍', e:'𝚎', f:'𝚏', g:'𝚐', h:'𝚑', i:'𝚒', j:'𝚓', k:'𝚔', l:'𝚕', m:'𝚖', n:'𝚗', o:'𝚘', p:'𝚙', q:'𝚚', r:'𝚛', s:'𝚜', t:'𝚝', u:'𝚞', v:'𝚟', w:'𝚠', x:'𝚡', y:'𝚢', z:'𝚣' };
        return map[c] || c;
      }).join('')
    };
    
    let msg = `🎨 *Fancy Text Styles for:* "${text}"\n\n`;
    for (const [name, styled] of Object.entries(styles)) {
      msg += `*${name}:*\n${styled}\n\n`;
    }
    
    await ctx.fReply(msg);
  }
};
