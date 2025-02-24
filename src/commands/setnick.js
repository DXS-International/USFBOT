const { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } = require('discord.js');
//
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setnick')
        .setDescription('Set the nickname of an user')
        .addUserOption(option=>option.setName('target').setDescription('User to change the name of').setRequired(true))
        .addStringOption(option=>option.setName('new-nickname').setDescription('The nickname to set to the user').setRequired(true))
        .addStringOption(option=>option.setName('reason').setDescription('Moderation Reason'))
        .addBooleanOption(option=>option.setName('notify').setDescription('Should the bot notify the user via this chat?'))
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({flags: 64});
        if (!(interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames))) {
            return interaction.editReply({content: 'You do not have the permission to edit this user nickname', flags: 64})
        }
        const moderated = new EmbedBuilder()
            .setColor(0x00ff00)
            .setDescription('Nickname Successfully Changed!');
        const target = interaction.options.getMember('target');
        const member = await interaction.guild.members.fetch(target.user.id)
        const reason = interaction.options.getString('reason') ?? 'No Reason Provided';
        const notify = interaction.options.getBoolean('notify') ?? false;
        if (interaction.guild.ownerId===member.id) {
            return interaction.editReply({content: 'I do not have the permission to edit this user nickname', flags: 64})
        }
        if (member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return interaction.editReply({content: 'I do not have the permission to edit this user nickname', flags: 64})
        }
        const newnick = interaction.options.getString('new-nickname');
        try {
            member.setNickname(`${newnick}`, `[${interaction.user.username}] : ${reason}`)
            if (notify) {
                let notifyEmbed = new EmbedBuilder()
                    .setTitle('Nickname Changed')
                    .setDescription(`${member}'s nickname has been Moderated by a staff member. \n**Reason:** ${reason}`);
                interaction.channel.send({embeds: [notifyEmbed]});
            }
            return interaction.editReply({embeds: [moderated], ephemeral: true})
        } catch (error) {
            console.log(error)
            const { erbed } = require('../embeds/embeds.js')
            erbed.setFooter({ text: `${error}`})
            return interaction.editReply({ embeds: [erbed] })
        }
    },
};