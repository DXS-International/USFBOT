const { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } = require('discord.js');
//
module.exports = {
    data: new SlashCommandBuilder()
    	.setName('kick').setDescription('Select and kick a member from the server')
    	.addUserOption(option=>option.setName('target').setDescription('The member to kick').setRequired(true))
    	.addStringOption(option=>option.setName('reason').setDescription('Kick reason'))
    	.setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });
        if (interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            const member = interaction.options.getMember('target');
            const target = await interaction.guild.members.fetch(member.user.id)
            if (target.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return interaction.editReply({content: 'You don\'t have the permission to kick this user!', flags: 64});
            }
            if (!target.manageable) {
                return interaction.editReply({content: 'The Bot doesn\'t have the permission to kick this user!', flags: 64});
            }
            if (!target.moderatable) {
                return interaction.editReply({content: 'The Bot doesn\'t have the permission to kick this user!', flags: 64});
            }
            const reason = interaction.options.getString('reason') ?? 'No reason provided';
            var kickEmbed = new EmbedBuilder()
            	.setDescription(`${target} has been kicked | ${reason}`);
            try {
                target.send(`You have been kicked from **${interaction.guild.name}** | ${reason}`);
            } catch (err) {
                kickEmbed.setFooter({text: 'couldn\'t DM the user'});
                console.log(err);
            }
            target.kick(`${interaction.user.username}: ${reason}`)
            	.then(interaction.editReply({embeds: [kickEmbed], flags: 64}))
            	.catch(error => {
                    console.error(error);
                    const { erbed } = require('../embeds/embeds.js')
                    erbed.setFooter(`${error}`)
                    return interaction.editReply({ embeds: [erbed] })
                });
        } else {
            interaction.editReply({content: 'You are missing the `KickMembers` Permission', flags: 64});
        }
    }
}