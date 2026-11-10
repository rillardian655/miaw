<div align="center">

# 🐾 MiawBot

**Cute, Reliable & Real-Time GitHub & Deployment Webhook Notifier**
*Delivering rich notifications to Discord & Telegram with feline flair*

[![License: MIT](https://img.shields.io/badge/License-MIT-pink.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/rillardian655/miaw/pulls)

</div>

---

## ⚡ What is MiawBot?

**MiawBot** is a lightweight, production-ready webhook microservice that listens to GitHub repository events and deployment webhooks, converting raw payloads into beautifully formatted, interactive alerts dispatched directly to your **Discord** channels and/or **Telegram** chats.

Equipped with an optional **"Miaw Personality Mode"**, it brings fun cat reactions, purrs, and ASCII art to keep development teams motivated!

---

## 🌟 Supported Events

| GitHub Event | Discord Output | Telegram Output | Cat Reaction |
| :--- | :--- | :--- | :--- |
| **`push`** | Rich embed with commit list, branch badge, clickable hashes, and author details | Clean HTML with clickable commit links & comparison URL | `🐾 Paws on keyboard! New commits landed!` |
| **`pull_request`** | PR number, title, head/base branches, author avatar, review status | Formatted PR card with status tags & body quote | `🎉 PR merged! / 📬 PR opened for review!` |
| **`watch` (Star)** | Golden embed celebrating your new stargazer | Celebration alert with total star counter | `⭐ (★ω★) Purrrrr! Shiny new star!` |
| **`workflow_run`** | Green/Red embed showing CI test status and links | Pass/Fail alert with direct run link | `✅ Purrfect! / 😿 Sad meow, build failed!` |
| **`issues`** | Issue opened, labeled, or closed with description | Issue tracker alert | `💬 (ㅇㅅㅇ) New issue opened!` |
| **`release`** | Tag name, release notes, and download links | Release notification card | `🚀 New release launched!` |
| **`ping`** | Test connection verified badge | Handshake confirmation | `🐾 Successfully connected!` |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/rillardian655/miaw.git
cd miaw
npm install
```

### 2. Configure Environment (`.env`)
Copy the example environment template:
```bash
cp .env.example .env
```
Fill in your webhook credentials in `.env`:
```ini
PORT=3456

# Optional: GitHub Webhook Secret for HMAC SHA-256 verification
GITHUB_WEBHOOK_SECRET=your_super_secret_token

# Discord Webhook URL (leave empty if not using Discord)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy

# Telegram Bot Token & Chat ID (leave empty if not using Telegram)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRstuVWXyz
TELEGRAM_CHAT_ID=-1001234567890

# Enable cute cat messages
MIAW_PERSONALITY=true
```

### 3. Start the Server
```bash
npm start
```
Open **`http://localhost:3456`** in your browser to access the **Interactive Webhook Simulator & Dashboard**!

---

## 🧪 Interactive Web Dashboard & Simulator

MiawBot includes a built-in web dashboard at `http://localhost:3456` where you can:
- Verify connection status of Discord and Telegram.
- Simulate GitHub events (Push, Star, PR, CI Success, CI Failure) with 1 click to test notifications without making real commits!
- View real-time webhook delivery logs.

```bash
# Or send a test notification directly from terminal:
npm run test:ping
```

---

## ⚙️ Configuring GitHub Webhook

1. Navigate to your GitHub repository -> **Settings** -> **Webhooks** -> **Add webhook**.
2. Set **Payload URL** to:
   ```
   https://your-domain-or-ngrok.com/webhook/github
   ```
3. Set **Content type** to `application/json`.
4. (Recommended) Set **Secret** to match `GITHUB_WEBHOOK_SECRET` in your `.env`.
5. Select **Let me select individual events**:
   - [x] Pushes
   - [x] Pull requests
   - [x] Issues
   - [x] Workflow runs
   - [x] Stars / Watches
   - [x] Releases
6. Click **Add webhook**. MiawBot will receive a ping event and greet your channel!

---

## 🐳 Docker Deployment

Run with Docker in seconds:
```bash
# Using docker-compose
docker compose up -d --build
```

Or build manually:
```bash
docker build -t miawbot .
docker run -p 3456:3456 --env-file .env miawbot
```

---

## 🧪 Running Automated Tests

MiawBot includes a comprehensive test suite covering payload parsing, HMAC security, Discord/Telegram formatters, and server endpoints:

```bash
npm test
```

---

## 📂 Project Structure

```
miaw/
├── bin/
│   └── miaw.js                  # CLI runner (miaw start, miaw ping)
├── src/
│   ├── config.js                # Environment config loader
│   ├── server.js                # Webhook receiver & dashboard server
│   ├── parsers/
│   │   └── github.js            # GitHub event payload parser
│   ├── formatters/
│   │   ├── discord.js           # Discord embed formatter
│   │   └── telegram.js          # Telegram HTML formatter
│   ├── services/
│   │   ├── notifier.js          # Multi-channel webhook dispatcher
│   │   └── security.js          # GitHub HMAC SHA-256 signature verifier
│   └── dashboard/
│       └── index.html           # Interactive web simulator & tester
├── test/
│   ├── github-parser.test.js    # Parser test suite
│   ├── formatters.test.js       # Formatting test suite
│   ├── security.test.js         # HMAC security verification test suite
│   └── server.test.js           # Server endpoint integration test suite
├── Dockerfile                   # Alpine Node.js production image
├── docker-compose.yml           # Compose specification
├── .env.example
├── package.json
└── README.md
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

<div align="center">
  Crafted with care by <a href="https://github.com/rillardian655">xianly runa</a> 🐾
</div>
