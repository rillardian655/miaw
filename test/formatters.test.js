import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatDiscordPayload } from '../src/formatters/discord.js';
import { formatTelegramPayload } from '../src/formatters/telegram.js';

describe('Message Formatters (Discord & Telegram)', () => {
  const mockPush = {
    type: 'push',
    repo: { name: 'rillardian655/miaw', url: 'https://github.com/rillardian655/miaw' },
    sender: { name: 'rillardian655', avatar: 'https://avatar.png', url: 'https://github.com/rillardian655' },
    branch: 'main',
    compareUrl: 'https://compare/url',
    commits: [
      { hash: 'a1b2c3d', message: 'feat: add notifier', url: 'https://commit/1', author: 'xianly' }
    ]
  };

  it('Discord formatter should produce valid embed structure', () => {
    const discord = formatDiscordPayload(mockPush, true);
    assert.equal(discord.username, 'MiawBot 🐾');
    assert.ok(Array.isArray(discord.embeds));
    assert.equal(discord.embeds.length, 1);
    assert.equal(discord.embeds[0].color, 0x2ecc71); // Green
    assert.match(discord.embeds[0].title, /1 new commit/);
  });

  it('Telegram formatter should produce valid HTML escaped text', () => {
    const telegram = formatTelegramPayload(mockPush, true);
    assert.equal(telegram.parse_mode, 'HTML');
    assert.match(telegram.text, /rillardian655\/miaw/);
    assert.match(telegram.text, /a1b2c3d/);
  });
});
