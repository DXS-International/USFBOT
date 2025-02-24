const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require('discord.js')
//
module.exports = {
    data: new SlashCommandBuilder()
        .setName('undeafen').setDescription('Undeafen a Member')
        .addUserOption(option=>option.setName('target').setDescription('Member to undeafen').setRequired(true))
        .addStringOption(option=>option.setName('reason').setDescription('Undeafen reason').setMaxLength(200))
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 })
        const member = interaction.options.getMember('target')
        const target = await interaction.guild.members.fetch(member.user.id)
        const reason = interaction.options.getString('reason') ?? `No Reason Provided`
        let undeafened = new EmbedBuilder();
        if (interaction.member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
            try {
                if (!(target.voice.channel)) {
                    undeafened.setColor(0xff0000).setDescription(`The Member is not in a Voice Channel!`);
                    return interaction.editReply({ embeds: [undeafened] })
                }
                target.edit({ deaf: false, reason: `[${interaction.user.username}]: ${reason}` })
                undeafened.setColor(0x00ff00).setDescription('Member undeafened successfully!');
                return interaction.editReply({ embeds: [undeafened] })
            } catch (error) {
                console.error(error)
                const { erbed } = require('../embeds/embeds.js')
                erbed.setFooter({ text: `${error}`})
                return interaction.editReply({ embeds: [erbed] })
            }
        } else {
            undeafened.setColor(0xff0000).setDescription('You are missing the required permission to run this command: `DeafenMembers`');
            return interaction.editReply({ embeds: [undeafened] })
        }
    }
}