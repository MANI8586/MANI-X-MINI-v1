module.exports = {
  name: 'fonts',
  aliases: ['fontlist', 'listfonts', 'fl'],
  description: 'Available fonts ki list dekhein',
  category: 'Info',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    let list = `🔤 *Available Fonts*\n\nUse: ${ctx.prefix}setfonts <number>\n\n`;
    const samples = [
      '1. Normal → Hello World',
      '2. Script → 𝒜𝓁𝓁 𝒢𝓇𝑒𝒶𝓉',
      '3. Italic → 𝐻𝑒𝑙𝑙𝑜 𝑊𝑜𝑟𝑙𝑑',
      '4. Bold Italic → 𝑯𝒆𝒍𝒍𝒐 𝑾𝒐𝒓𝒍𝒅',
      '5. Bold → 𝐇𝐞𝐥𝐥𝐨 𝐖𝐨𝐫𝐥𝐝',
      '6. Sans → 𝖧𝖾𝗅𝗅𝗈 𝖶𝗈𝗋𝗅𝖽',
      '7. Sans Italic → 𝘏𝘦𝘭𝘭𝘰 𝘞𝘰𝘳𝘭𝘥',
      '8. Sans Bold Italic → 𝙃𝙚𝙡𝙡𝙤 𝙒𝙤𝙧𝙡𝙙',
      '9. Bold Sans → 𝗛𝗲𝗹𝗹𝗼 𝗪𝗼𝗿𝗹𝗱',
      '10. Fraktur → 𝔥𝔢𝔩𝔩𝔬 𝔴𝔬𝔯𝔩𝔡',
      '11. Bold Fraktur → 𝖍𝖊𝖑𝖑𝖔 𝖜𝖔𝖗𝖑𝖉',
      '12. Monospace → 𝚑𝚎𝚕𝚕𝚘 𝚠𝚘𝚛𝚕𝚍',
      '13. Double Struck → 𝕙𝕖𝕝𝕝𝕠 𝕨𝕠𝕣𝕝𝕕',
      '14. Mono Alt → 𝚑𝚎𝚕𝚕𝚘 𝚠𝚘𝚛𝚕𝚍',
    ];
    list += samples.join('\n');
    await conn.sendMessage(m.key.remoteJid, { text: list }, { quoted: m });
  }
};
