import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 3456,
  githubSecret: process.env.GITHUB_WEBHOOK_SECRET || '',
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  miawPersonality: process.env.MIAW_PERSONALITY !== 'false'
};
