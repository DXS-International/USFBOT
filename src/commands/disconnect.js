const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require('discord.js')
//
module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect').setDescription('Disconnect a Member from a Voice Channel')
        .addUserOption(option=>option.setName('target').setDescription('Member to disconnect').setRequired(true))
        .addStringOption(option=>option.setName('reason').setDescription('Disconnect reason').setMaxLength(200))
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 })
        const member = interaction.options.getMember('target')
        const target = await interaction.guild.members.fetch(member.user.id)
        const reason = interaction.options.getString('reason') ?? `No Reason Provided`
        let disconnected = new EmbedBuilder();
        if (interaction.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            try {
                if (!(target.voice.channel)) {
                    disconnected.setColor(0xff0000).setDescription(`The Member is not in a Voice Channel!`);
                    await interaction.editReply({ embeds: [disconnected] }); return;
                }
                target.voice.disconnect(null, `[${interaction.user.username}]: ${reason}`)
                disconnected.setColor(0x00ff00).setDescription('Member disconnected successfully!');
                await interaction.editReply({ embeds: [disconnected] }); return;
            } catch (error) {
                console.error(error)
                disconnected.setColor(0xff0000).setDescription(`An unknown error occurred while executing this command!\n${error}`);
                await interaction.editReply({ embeds: [disconnected] }); return;
            }
        } else {
            disconnected.setColor(0xff0000).setDescription('You are missing the required permission to run this command: `ModerateMembers`');
            await interaction.editReply({ embeds: [disconnected] }); return;
        }
    }
}