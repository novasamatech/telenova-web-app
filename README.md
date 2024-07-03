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

## Generate types for `$path`
`remix-routes.d.ts` is responsible for defining types for the existing routes in the project.

If some route needs to be added, run `npm run build` in order to `remix-routes` regenerate types and save them in
`app/types/remix-routes.d.ts`.

This file should not be ignored via `.gitignore` otherwise GitHub CI will fail on `Type checking` job. 

### Start the application locally:
1) Create a new bot in tg via @BotFather
2) Create an external domain for your local host (`localTunnel` or `ngrok` - `lt -p 3000 -s your-domain-name` or `ngrok http --domain=your-domain`)
3) Start dev server with `npm run dev`
4) Put your variables into `.env` file like described in `.env.example`
5) Optional - connect web app domain to the local bot (via BotFather) to open gifts locally
