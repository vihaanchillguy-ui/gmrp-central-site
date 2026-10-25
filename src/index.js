require('dotenv').config();

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  PermissionsBitField,
  REST,
  Routes,
  SlashCommandBuilder,
} = require('discord.js');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('Missing DISCORD_TOKEN, CLIENT_ID, or GUILD_ID environment variable.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check whether GMRP Central is online.'),
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Post the GMRP Central support ticket panel.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),
].map(command => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  console.log('Registered GMRP Central slash commands.');
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'ping') {
        return interaction.reply({ content: '🏓 GMRP Central is online.', ephemeral: true });
      }

      if (interaction.commandName === 'setup') {
        const embed = new EmbedBuilder()
          .setTitle('GMRP Central Support')
          .setDescription('Press **Create Support Ticket** to open a private support channel. Please explain your issue clearly.')
          .setColor(0x1E88E5);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('gmrp_create_ticket')
            .setLabel('Create Support Ticket')
            .setStyle(ButtonStyle.Primary)
        );

        return interaction.reply({ embeds: [embed], components: [row] });
      }
    }

    if (interaction.isButton() && interaction.customId === 'gmrp_create_ticket') {
      const guild = interaction.guild;
      if (!guild) return interaction.reply({ content: 'This button only works inside the server.', ephemeral: true });

      const existing = guild.channels.cache.find(channel =>
        channel.type === ChannelType.GuildText &&
        channel.topic === `gmrp-ticket-owner:${interaction.user.id}`
      );

      if (existing) {
        return interaction.reply({ content: `You already have a ticket open: ${existing}`, ephemeral: true });
      }

      const safeName = interaction.user.username.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 18) || 'member';
      const channel = await guild.channels.create({
        name: `ticket-${safeName}`,
        type: ChannelType.GuildText,
        topic: `gmrp-ticket-owner:${interaction.user.id}`,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ] },
          { id: client.user.id, allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.ManageChannels,
          ] },
        ],
      });

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('gmrp_close_ticket')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `${interaction.user}, your support ticket is open. Describe your issue here. Staff will need permission to view this channel before they can help.`,
        components: [closeRow],
      });

      return interaction.reply({ content: `Your ticket has been created: ${channel}`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'gmrp_close_ticket') {
      const channel = interaction.channel;
      if (!channel || !channel.topic?.startsWith('gmrp-ticket-owner:')) {
        return interaction.reply({ content: 'This is not a recognised ticket channel.', ephemeral: true });
      }

      const ownerId = channel.topic.split(':')[1];
      const canManage = interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageChannels);
      if (interaction.user.id !== ownerId && !canManage) {
        return interaction.reply({ content: 'Only the ticket creator or a channel manager can close this ticket.', ephemeral: true });
      }

      await interaction.reply({ content: 'Ticket closed. This channel will be deleted in a few seconds.' });
      setTimeout(() => channel.delete('GMRP Central ticket closed').catch(() => {}), 4000);
    }
  } catch (error) {
    console.error(error);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'Something went wrong. Check the bot logs or permissions.', ephemeral: true }).catch(() => {});
    }
  }
});

(async () => {
  try {
    await registerCommands();
    await client.login(DISCORD_TOKEN);
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
})();
