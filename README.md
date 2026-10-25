# GMRP Central Bot

A Discord support-ticket bot for Greater Melbourne Roleplay.

## Deploy on Render
The repository includes `render.yaml` for a background worker. In Render, create a new Blueprint from this repository and follow the prompts. Add the required secret values in Render's environment settings.

Required environment variables:
- `DISCORD_TOKEN`: bot token from the Discord Developer Portal. Keep it secret.
- `CLIENT_ID`: Discord application ID (already prefilled in `render.yaml`).
- `GUILD_ID`: your GMRP Discord server ID.
- `STAFF_ROLE_ID`: optional Discord role ID that should see and close tickets.

The service starts with `npm start`. It must run as a background worker, not a static website. GitHub Pages cannot run a Discord bot.

## Run locally
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Fill in the values.
4. Run `npm install`, then `npm start`.

## Commands and features
- `/ping`: check whether the bot is online.
- `/setup`: post the support ticket panel (requires Manage Server).
- Ticket creation makes a private channel visible to the creator, bot, and configured staff role.
- Ticket creator, configured staff role, or a channel manager can close a ticket.

Never commit `.env`, and never share your bot token. Test the bot and role permissions in a private channel before relying on it in your main server.
