# GMRP Central Bot

A starter Discord bot for Greater Melbourne Roleplay.

## Run locally
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Fill in your Discord bot token and server ID in `.env`.
4. Run `npm install`.
5. Run `npm start`.

## Deploy
Use a Node.js hosting service that supports persistent processes. Set `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID` in the host's environment settings, then use `npm start` as the start command.

Do not commit `.env` or share your bot token. Enable the **Server Members Intent** only if your features need it; this starter does not require it.

## Included
- `/ping`
- `/setup` (posts a basic support panel)
- Support ticket buttons that create private ticket channels
- Close-ticket button

This is a starter bot, not a fully configured production moderation system. Set the required permissions and test in a private server before using it in your main community.
