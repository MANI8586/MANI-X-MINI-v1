const os = require('os');
const fs = require('fs');
const { formatUptime, measureSpeed } = require('../helper/utils');
const { applyFont } = require('../helper/fonts');
const settings = require('../settings');

module.exports = {
  name: 'menu',
  aliases: ['help', 'm', 'cmds', 'commands', 'list'],
  description: 'Bot ki tamam commands ki list dekhein',
  category: 'Info',
  isOwner: false,
  isAdmin: false,
  isPremium: false,
  run: async (conn, m, args, ctx) => {
    const us = ctx.loadUserSettings();
    const fontNum = us.font || 1;
    const botName = us.botName || settings.BOT_NAME;
    const menuImg = us.menuImage || settings.MENU_IMAGE;
    const mode = us.mode || 'public';
    const uptime = formatUptime(Date.now() - global.botStartTime);
    const speed = measureSpeed();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB');
    const host = os.hostname();

    const categories = {};
    for (const [cmdName, info] of ctx.COMMANDS_INFO) {
      const cat = info.category || 'Other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({ name: cmdName, ...info });
    }

    let cmdList = '';
    for (const [cat, cmds] of Object.entries(categories).sort()) {
      cmdList += `\n┌─── *${cat}* ───┐\n`;
      for (const cmd of cmds.sort((a, b) => a.name.localeCompare(b.name))) {
        const aliases = cmd.aliases.length ? ` (${cmd.aliases.join('/')})` : '';
        cmdList += `│ ${ctx.prefix}${cmd.name}${aliases}\n│ ↳ ${cmd.description}\n`;
      }
      cmdList += `└───────────────┘\n`;
    }

    const totalCmds = ctx.COMMANDS_INFO.size;
    const readmore = '\u200e\u200b'.repeat(1000);

    let menuText =
      `╔══════════════════════╗\n` +
      `║      *${botName}*      ║\n` +
      `╚══════════════════════╝\n\n` +
      `👤 *Owner :* ${us.ownerNumber || ctx.senderNumber}\n` +
      `🔑 *Prefix :* ${ctx.prefix}\n` +
      `🌍 *Mode :* ${mode}\n` +
      `🖥️ *Host :* ${host}\n` +
      `⏱️ *Uptime :* ${uptime}\n` +
      `⚡ *Speed :* ${speed}ms\n` +
      `📅 *Date :* ${dateStr}\n` +
      `🕐 *Time :* ${timeStr}\n` +
      `🔢 *Total Cmds :* ${totalCmds}\n` +
      `🎖️ *Credits :* James Official\n` +
      readmore + `\n` + cmdList;

    if (fontNum > 1) menuText = applyFont(menuText, fontNum);

    try {
      let imgMsg;
      if (menuImg && menuImg !== 'quoted' && menuImg.startsWith('http')) {
        imgMsg = { image: { url: menuImg }, caption: menuText };
      } else if (menuImg && fs.existsSync(menuImg)) {
        imgMsg = { image: fs.readFileSync(menuImg), caption: menuText };
      } else throw new Error('no image');
      await conn.sendMessage(m.key.remoteJid, imgMsg, { quoted: m });
    } catch {
      await conn.sendMessage(m.key.remoteJid, { text: menuText }, { quoted: m });
    }
  }
};
