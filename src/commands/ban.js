const { PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require('discord.js')
//
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban').setDescription('Ban a Member')
        .addUserOption(option=>option.setName('target').setDescription('Member to Ban').setRequired(true))
        .addStringOption(option=>option.setName('reason').setDescription('Ban Reason')),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 })
        const member = interaction.options.getMember('target')
        const target = await interaction.guild.members.fetch(member.user.id)
        const reason = interaction.options.getString('reason') ?? 'No reason provided'
        let banEmbed = new EmbedBuilder();
        if (!(interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))) {
            return interaction.editReply(`You are not allowed to perform this action!\n **Reason:** Missing \`BanMembers\` Permission`)
        }
        if (!(target.bannable)) {
            return interaction.editReply(`The Bot is not allowed to Moderate this Member!`)
        }
        if (interaction.member.roles.highest.position < target.roles.highest.position) {
            if (!(interaction.member.id === interaction.guild.ownerId)) {
                return interaction.editReply(`You are not allowed to perform this action!\n **Reason:** Member with Higher rank`)
            }
        }
        target.send(`You have been **banned** from \`${interaction.guild.name}\` | ${reason}`)
            .then(i => {
                banEmbed.setFooter({ text: 'User DMed successfully!'});
            })
            .catch(error => {
                console.error
                banEmbed.setFooter({ text: 'Could not DM the User' });
            });
        target.ban({ reason: `[${interaction.user.username}] : ${reason}` })
            .then(i => {
                banEmbed.setColor(0x00ff00).setDescription(`${target} has been **banned** | ${reason}`)
                return interaction.editReply({ embeds: [banEmbed] })
            }).catch(error => {
                console.error(error)
                const { erbed } = require('../embeds/embeds.js')
                erbed.setFooter({ text: `${error}`})
                return interaction.editReply({ embeds: [erbed] })
            });
    }
}