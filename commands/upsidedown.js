module.exports = {
  name: 'upsidedown',
  aliases: ['flip', 'reverse'],
  description: 'Text ko upside-down karein',
  category: 'Fun',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const text = args.join(' ');
    if (!text) return ctx.fReply(`❌ Usage: ${ctx.prefix}upsidedown <text>`);
    
    const map = {
      A:'∀', B:'𐐒', C:'Ↄ', D:'◖', E:'Ǝ', F:'Ⅎ', G:'⅁', H:'H', I:'I', J:'ſ', K:'⋊', L:'⅂', M:'W', N:'N', O:'O', P:'Ԁ', Q:'Ό', R:'ᴚ', S:'S', T:'⊥', U:'∩', V:'Λ', W:'M', X:'X', Y:'⅄', Z:'Z',
      a:'ɐ', b:'q', c:'ɔ', d:'p', e:'ǝ', f:'ɟ', g:'ɓ', h:'ɥ', i:'ᴉ', j:'ɾ', k:'ʞ', l:'l', m:'ɯ', n:'u', o:'o', p:'d', q:'b', r:'ɹ', s:'s', t:'ʇ', u:'n', v:'ʌ', w:'ʍ', x:'x', y:'ʎ', z:'z',
      '0':'0', '1':'⇂', '2':'ᄅ', '3':'Ɛ', '4':'ᔭ', '5':'ϛ', '6':'9', '7':'⅂', '8':'8', '9':'6',
      '.':'˙', ',':'\'', '?':'¿', '!':'¡', '"':',,', '\'':',', '&':'⅋', '_':'‾'
    };
    
    const result = text.split('').reverse().map(c => map[c] || c).join('');
    await ctx.fReply(result);
  }
};
