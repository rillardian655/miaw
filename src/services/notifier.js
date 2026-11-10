import { formatDiscordPayload } from '../formatters/discord.js';
import { formatTelegramPayload } from '../formatters/telegram.js';

export const deliveryHistory = [];
const MAX_HISTORY = 40;

export async function dispatchNotification(parsedData, targetConfig) {
  const { discordWebhookUrl, telegramBotToken, telegramChatId, miawPersonality } = targetConfig;
  const results = {
    discord: null,
    telegram: null
  };

  // 1. Send to Discord
  if (discordWebhookUrl) {
    try {
      const payload = formatDiscordPayload(parsedData, miawPersonality);
      const res = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      results.discord = {
        ok: res.ok,
        status: res.status
      };
    } catch (err) {
      results.discord = {
        ok: false,
        error: err.message
      };
    }
  }

  // 2. Send to Telegram
  if (telegramBotToken && telegramChatId) {
    try {
      const payload = formatTelegramPayload(parsedData, miawPersonality);
      const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          ...payload
        })
      });
      const data = await res.json();
      results.telegram = {
        ok: data.ok,
        status: res.status,
        description: data.description
      };
    } catch (err) {
      results.telegram = {
        ok: false,
        error: err.message
      };
    }
  }

  // Save to history
  deliveryHistory.unshift({
    id: Math.random().toString(36).substring(2, 9),
    type: parsedData.type,
    repo: parsedData.repo?.name || 'unknown',
    time: new Date().toISOString(),
    results
  });

  if (deliveryHistory.length > MAX_HISTORY) {
    deliveryHistory.pop();
  }

  return results;
}
