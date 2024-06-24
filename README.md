<div align="center">
  <img src="https://github.com/novasamatech/nova-wallet-web-app/assets/63446892/492b624c-fb27-45f8-9ccd-759f3a172d2c" alt="Telenova logo">
</div>

# Introduction

## Key features
🌐 Send & Receive DOT and KSM tokens to/from any blockchain address

💲 View your Polkadot and Kusama balances in fiat currencies

💌 Balance notifications for your wallet in Telegram

🔐 Secured by your personal Telegram cloud with manual account backups

## Getting Started

To install all dependencies:

```bash
npm install
```
To start the project in dev mode:

```bash
npm run dev
```

### Start the application locally:
1) Create a new bot in tg via @BotFather
2) Create a external domain for your local host (`localTunnel/ngrok` - `lt -p 3000 -s your-domain-name` or `ngrok http --domain=your-domain`)
3) Run yarn dev
5) Put your variables into the backend repo env file (BOT_API_KEY, BOT_ALIAS, NOVA_APP_HOST)
6) Run docker (`docker compose up`)
7) Optional - connect web app domain to the local bot (via BotFather) to open gifts locally 

