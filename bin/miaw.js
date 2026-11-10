#!/usr/bin/env node
import pc from 'picocolors';
import { config } from '../src/config.js';
import { createServer } from '../src/server.js';
import { dispatchNotification } from '../src/services/notifier.js';

const cmd = process.argv[2] || 'start';

if (cmd === 'ping') {
  console.log(pc.cyan('\n🐾 MiawBot — Sending test ping to configured channels...'));

  const testPayload = {
    type: 'ping',
    repo: { name: 'rillardian655/miaw', url: 'https://github.com/rillardian655/miaw' },
    sender: { name: 'rillardian655', avatar: 'https://github.com/rillardian655.png' },
    zen: 'Testing connection from MiawBot CLI! (=^･ω･^=)'
  };

  dispatchNotification(testPayload, config).then(res => {
    console.log('\nResults:');
    if (res.discord) {
      console.log(`  Discord:  ${res.discord.ok ? pc.green('SUCCESS') : pc.red(`FAILED (${res.discord.error || res.discord.status})`)}`);
    } else {
      console.log(`  Discord:  ${pc.dim('Skipped (no DISCORD_WEBHOOK_URL in .env)')}`);
    }

    if (res.telegram) {
      console.log(`  Telegram: ${res.telegram.ok ? pc.green('SUCCESS') : pc.red(`FAILED (${res.telegram.error || res.telegram.description})`)}`);
    } else {
      console.log(`  Telegram: ${pc.dim('Skipped (no TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env)')}`);
    }
    console.log();
  });
} else if (cmd === 'start' || cmd === 'server') {
  const app = createServer();
  const port = config.port;

  app.listen(port, () => {
    console.log();
    console.log(`  ${pc.bold(pc.magenta('🐾 MiawBot'))} ${pc.green('is running online!')}`);
    console.log(`  ${pc.cyan('●')} Dashboard:   ${pc.underline(`http://localhost:${port}`)}`);
    console.log(`  ${pc.cyan('●')} Webhook URL: ${pc.underline(`http://localhost:${port}/webhook/github`)}`);
    console.log(`  ${pc.cyan('●')} Healthcheck: ${pc.underline(`http://localhost:${port}/health`)}`);
    console.log();
  });
} else {
  console.log(`
🐾 MiawBot — Cute GitHub Webhook Notifier

Usage:
  miaw start       Start the webhook server
  miaw ping        Send a test ping notification to Discord / Telegram
  miaw --help      Show this help message
`);
}
