# miaw

A lightweight webhook forwarder that listens for GitHub and deployment events, formats them into structured payloads, and dispatches them to Discord channels and Telegram chats.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](Dockerfile)

---

## Architecture

```
GitHub / CI Webhook
        │
        ▼
[ POST /webhook/github ]
        │
        ├─► HMAC SHA-256 Signature Verification (X-Hub-Signature-256)
        │
        ├─► Event Parser (push, pr, issues, star, workflow_run, release)
        │
        ├─► Payload Formatters
        │      ├── Discord Embed Formatter
        │      └── Telegram HTML Formatter
        │
        ▼
[ Dispatched to Discord & Telegram ]
```

---

## Features

- **Multi-channel delivery**: Forward events simultaneously to Discord webhooks and Telegram chats.
- **Event parsing**: Native support for GitHub `push`, `pull_request`, `issues`, `watch` (stars), `workflow_run` (CI status), and `release`.
- **HMAC verification**: Verifies `X-Hub-Signature-256` headers using your webhook secret to ensure payloads originate from GitHub.
- **Built-in simulator UI**: Web dashboard at `http://localhost:3456` to test event forwarding without triggering real GitHub actions.
- **Docker support**: Multi-stage lightweight Alpine container image with compose definition included.
- **Zero heavy dependencies**: Minimal runtime footprint powered by Express.

---

## Supported Events

| GitHub Event | Discord Format | Telegram Format |
| :--- | :--- | :--- |
| `push` | Embed with branch name, commit count, commit links, and author info | HTML message with commit list and comparison URL |
| `pull_request` | Embed with PR title, number, branch target, status, and author | Message card with base/head branch and description quote |
| `watch` (star) | Highlight embed with user handle and total star count | Notification with direct repository link |
| `workflow_run` | Color-coded status embed (pass/fail) with run URL | Status alert for CI workflow completion |
| `issues` | Embed with issue title, number, action, and description | HTML notification with issue link |
| `release` | Embed with release tag, title, and release page link | Release announcement |
| `ping` | Connection verification embed | Handshake confirmation message |

---

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher (or Docker)

### Installation

```bash
git clone https://github.com/rillardian655/miaw.git
cd miaw
npm install
```

### Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```ini
PORT=3456

# Optional: GitHub Webhook Secret (used for HMAC verification)
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Discord Integration (leave blank to disable)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_id/your_token

# Telegram Integration (leave blank to disable)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRstuVWXyz
TELEGRAM_CHAT_ID=-1001234567890

# Optional personality toggle (true / false)
MIAW_PERSONALITY=false
```

### Running the Server

```bash
# Start server
npm start

# Development mode with file watching
npm run dev
```

The server starts by default on port `3456`.
- **Webhook endpoint**: `http://localhost:3456/webhook/github`
- **Dashboard / Simulator**: `http://localhost:3456`
- **Health check**: `http://localhost:3456/health`

---

## Webhook Setup in GitHub

1. Open your repository on GitHub.
2. Go to **Settings** > **Webhooks** > **Add webhook**.
3. Set **Payload URL** to your server URL (e.g., `https://your-domain.com/webhook/github`).
4. Set **Content type** to `application/json`.
5. Enter the **Secret** matching `GITHUB_WEBHOOK_SECRET` in your `.env`.
6. Select the events you want to trigger (Pushes, Pull requests, Issues, Workflow runs, Stars, Releases).
7. Save the webhook.

---

## Testing

### Automated Test Suite

Run the unit and integration tests:

```bash
npm test
```

### Test Ping via CLI

Verify your Discord or Telegram configuration without triggering a real GitHub event:

```bash
npm run test:ping
```

### Interactive Simulator

Open `http://localhost:3456` in your browser to dispatch test payloads (`push`, `star`, `pull_request`, `workflow_run`) directly to your configured channels and review live delivery logs.

---

## Deployment

### Docker Compose

```bash
docker compose up -d --build
```

### Docker CLI

```bash
docker build -t miaw .
docker run -d -p 3456:3456 --env-file .env --name miaw miaw
```

---

## Project Structure

```
miaw/
├── bin/
│   └── miaw.js                  # CLI entrypoint
├── src/
│   ├── config.js                # Environment configuration loader
│   ├── server.js                # Express HTTP server & route handlers
│   ├── parsers/
│   │   └── github.js            # GitHub webhook event parser
│   ├── formatters/
│   │   ├── discord.js           # Discord embed serializer
│   │   └── telegram.js          # Telegram HTML serializer
│   ├── services/
│   │   ├── notifier.js          # Webhook dispatcher
│   │   └── security.js          # HMAC SHA-256 signature verifier
│   └── dashboard/
│       └── index.html           # Web simulator interface
├── test/
│   ├── github-parser.test.js    # Parser test suite
│   ├── formatters.test.js       # Serializer test suite
│   ├── security.test.js         # Security & HMAC verification tests
│   └── server.test.js           # End-to-end route tests
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

## License

This project is licensed under the [MIT License](LICENSE).
