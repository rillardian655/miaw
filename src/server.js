import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { config } from './config.js';
import { parseGitHubEvent } from './parsers/github.js';
import { verifyGitHubSignature } from './services/security.js';
import { dispatchNotification, deliveryHistory } from './services/notifier.js';

export function createServer(customConfig = {}) {
  const activeConfig = { ...config, ...customConfig };
  const app = express();

  // Capture raw body for GitHub HMAC verification
  app.use(express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // Web Dashboard
  app.get('/', (req, res) => {
    const htmlPath = path.resolve(import.meta.dirname, './dashboard/index.html');
    res.sendFile(htmlPath);
  });

  // Status API for Dashboard
  app.get('/api/status', (req, res) => {
    res.json({
      port: activeConfig.port,
      discordConfigured: Boolean(activeConfig.discordWebhookUrl),
      telegramConfigured: Boolean(activeConfig.telegramBotToken && activeConfig.telegramChatId),
      secretConfigured: Boolean(activeConfig.githubSecret),
      personality: activeConfig.miawPersonality
    });
  });

  // History API for Dashboard
  app.get('/api/history', (req, res) => {
    res.json(deliveryHistory);
  });

  // Main GitHub Webhook Endpoint
  app.post('/webhook/github', async (req, res) => {
    const event = req.headers['x-github-event'];
    const signature = req.headers['x-hub-signature-256'];

    if (!event) {
      return res.status(400).json({ error: 'Missing X-GitHub-Event header' });
    }

    // Verify HMAC signature if secret configured
    if (activeConfig.githubSecret) {
      const isValid = verifyGitHubSignature(activeConfig.githubSecret, req.rawBody, signature);
      if (!isValid) {
        console.log(pc.red('✖ [MiawBot] Invalid GitHub Webhook signature!'));
        return res.status(401).json({ error: 'Invalid HMAC signature' });
      }
    }

    try {
      const parsed = parseGitHubEvent(event, req.body);
      if (!parsed) {
        return res.status(400).json({ error: 'Invalid or empty webhook payload' });
      }

      console.log(
        `${pc.cyan('🐾 [MiawBot]')} Received GitHub event: ` +
        `${pc.bold(event)} for ${pc.yellow(parsed.repo?.name || 'unknown')}`
      );

      // Dispatch to Discord and/or Telegram
      const results = await dispatchNotification(parsed, activeConfig);

      res.status(200).json({
        success: true,
        event,
        dispatched: results
      });
    } catch (err) {
      console.error(pc.red(`✖ Error processing webhook: ${err.message}`));
      res.status(500).json({ error: 'Internal processing error', details: err.message });
    }
  });

  // Event Simulator Endpoint
  app.post('/api/simulate', async (req, res) => {
    const { type = 'push' } = req.body || {};

    let mockPayload;
    let eventName = 'push';

    if (type === 'star') {
      eventName = 'watch';
      mockPayload = {
        action: 'started',
        repository: { name: 'miaw', full_name: 'rillardian655/miaw', stargazers_count: 42, html_url: 'https://github.com/rillardian655/miaw' },
        sender: { login: 'octocat', avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', html_url: 'https://github.com/octocat' }
      };
    } else if (type === 'pull_request') {
      eventName = 'pull_request';
      mockPayload = {
        action: 'opened',
        repository: { name: 'miaw', full_name: 'rillardian655/miaw', html_url: 'https://github.com/rillardian655/miaw' },
        pull_request: {
          number: 1,
          title: 'Add cute cat purring audio on notification arrival',
          html_url: 'https://github.com/rillardian655/miaw/pull/1',
          body: 'This PR adds realistic cat sound effects for all events!',
          base: { ref: 'main' },
          head: { ref: 'feat/audio-effects' }
        },
        sender: { login: 'rillardian655', avatar_url: 'https://github.com/rillardian655.png', html_url: 'https://github.com/rillardian655' }
      };
    } else if (type === 'ci_success' || type === 'ci_failure') {
      eventName = 'workflow_run';
      mockPayload = {
        repository: { name: 'miaw', full_name: 'rillardian655/miaw', html_url: 'https://github.com/rillardian655/miaw' },
        workflow_run: {
          name: 'CI / Automated Tests',
          status: 'completed',
          conclusion: type === 'ci_success' ? 'success' : 'failure',
          head_branch: 'main',
          html_url: 'https://github.com/rillardian655/miaw/actions'
        },
        sender: { login: 'github-actions[bot]', avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' }
      };
    } else if (type === 'ping') {
      eventName = 'ping';
      mockPayload = {
        zen: 'Design for failure.',
        repository: { name: 'miaw', full_name: 'rillardian655/miaw', html_url: 'https://github.com/rillardian655/miaw' },
        sender: { login: 'rillardian655', avatar_url: 'https://github.com/rillardian655.png' }
      };
    } else {
      // Default: push event
      eventName = 'push';
      mockPayload = {
        ref: 'refs/heads/main',
        compare: 'https://github.com/rillardian655/miaw/commit/1234567',
        repository: { name: 'miaw', full_name: 'rillardian655/miaw', html_url: 'https://github.com/rillardian655/miaw' },
        commits: [
          { id: 'a1b2c3d4e5f6', message: 'feat: add interactive discord & telegram webhook formatter', url: 'https://github.com/rillardian655/miaw', author: { name: 'xianly runa' } },
          { id: 'f6e5d4c3b2a1', message: 'docs: update setup instructions and env examples', url: 'https://github.com/rillardian655/miaw', author: { name: 'xianly runa' } }
        ],
        sender: { login: 'rillardian655', avatar_url: 'https://github.com/rillardian655.png', html_url: 'https://github.com/rillardian655' }
      };
    }

    const parsed = parseGitHubEvent(eventName, mockPayload);
    const results = await dispatchNotification(parsed, activeConfig);

    res.json({ ok: true, type, event: eventName, results });
  });

  return app;
}

// Direct run
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const app = createServer();
  const port = config.port;

  app.listen(port, () => {
    console.log();
    console.log(`  ${pc.bold(pc.magenta('🐾 MiawBot'))} ${pc.green('is running online!')}`);
    console.log(`  ${pc.cyan('●')} Dashboard:   ${pc.underline(`http://localhost:${port}`)}`);
    console.log(`  ${pc.cyan('●')} Webhook URL: ${pc.underline(`http://localhost:${port}/webhook/github`)}`);
    console.log(`  ${pc.cyan('●')} Healthcheck: ${pc.underline(`http://localhost:${port}/health`)}`);
    console.log();
    console.log(`  ${pc.dim('Discord integration:')} ${config.discordWebhookUrl ? pc.green('CONFIGURED') : pc.yellow('NOT CONFIGURED')}`);
    console.log(`  ${pc.dim('Telegram integration:')} ${config.telegramBotToken ? pc.green('CONFIGURED') : pc.yellow('NOT CONFIGURED')}`);
    console.log(`  ${pc.dim('GitHub Secret HMAC:')}  ${config.githubSecret ? pc.green('ENABLED') : pc.yellow('DISABLED (DEV MODE)')}`);
    console.log();
  });
}

