const { SlashCommandBuilder } = require('discord.js')
const { team } = require('../../config.json')
//
module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave').setDescription('Team Only')
        .addStringOption(option=>option.setName('guild').setDescription('Guild').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });
        if (!(team.includes(interaction.user.id))) {
            return interaction.editReply('Unauthorised!')
        }
        const guild_option = interaction.options.getString('guild')
        const guild = await interaction.client.guilds.cache.get(guild_option)
        if (!guild) {
            return interaction.editReply('No guild with that ID for the bot!')
        }
        guild.leave()
        return interaction.editReply('Done successfully')
    }
}