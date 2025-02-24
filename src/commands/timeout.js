const { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const { discord } = require('../../config.json');
var ms = require('ms');
//
module.exports = {
    data: new SlashCommandBuilder()
    	.setName('timeout').setDescription('Timeout a guild member')
    	.addUserOption(option=>option.setName('target').setDescription('Member to timeout').setRequired(true))
    	.addStringOption(option=>option.setName('duration').setDescription('Duration of the timeout').setRequired(true))
    	.addStringOption(option=>option.setName('reason').setDescription('Reason of the timeout'))
    	.setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });
        const member = interaction.options.getMember('target');
        const target = await interaction.guild.members.fetch(member.user.id)
        let errorcase = new EmbedBuilder()
            .setTitle('Could not Timeout the user')
            .setDescription('TimeoutUser');
        if (interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            if (target.bannable) {
                const time = interaction.options.getString('duration');
                const temp = await ms(time);
                const reason = interaction.options.getString('reason') ?? 'No reason provided';
                const timeoutEmbed = new EmbedBuilder()
                	.setDescription(`${target} has been muted for ${time} | ${reason}`);
                try {
                    target.timeout(temp, `${interaction.user.username}: ${reason}`);
                } catch (error) {
                    console.error(error);
                    const { erbed } = require('../embeds/embeds.js')
                    erbed.setFooter({ text: `${error}`})
                    return interaction.editReply({ embeds: [erbed] })
                }
                try {
                    target.send(`You have been timed out in **${interaction.guild.name}** for ${time} | ${reason}`);
                } catch (error) {
                    console.error(error);
                    timeoutEmbed.setFooter({ text: `Could not DM the user`});
                }
                return interaction.editReply({embeds: [timeoutEmbed], ephemeral: true});
            } else {
                errorcase.setDescription(`There was a permission error while trying to execute this command. Common causes:\n- You do not have the permission to timeout the user.\n- The bot does not have the permission to perform this action.\nIf you believe this is an error, feel free to report it in our [Discord Server](${discord})`);
                return interaction.editReply({embeds: [errorcase], ephemeral: true});
            }
        } else {
            errorcase.setDescription('You are missing the required permission to run this command: `ModerateMembers`');
            return interaction.editReply({embeds: [errorcase], ephemeral: true});
        }
    },
};