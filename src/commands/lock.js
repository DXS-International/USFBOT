const { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } = require('discord.js');
//
module.exports = {
    data: new SlashCommandBuilder()
    	.setName('lock').setDescription('Lock a channel and post an embed with the reason')
    	.addChannelOption(option=>option.setName('channel').setDescription('Channel to lock').setRequired(false))
    	.addStringOption(option=>option.setName('reason').setDescription('Reason of the lock').setRequired(false))
    	.setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({flags: 64});
        if (interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                interaction.editReply(`I'm missing the required permission to manage this channel: ManageChannels`);
                return;
            }
            let channel = interaction.options.getChannel('channel') ?? interaction.channel;
            let reason = interaction.options.getString('reason') ?? 'No reason provided';
            try {
                const LockMessage = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('This channel has been locked!')
                    .setDescription(`Locked for reason: ${reason}`)
                    .setFooter({text: 'You are not muted, this channel is locked for everyone. Please don\'t DM people.'});
                channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false, AddReactions: false, SendMessagesInThreads: false, CreatePublicThreads: false, CreatePrivateThreads: false });
                interaction.editReply({content: `Successfully locked ${channel}`, flags: 64});
                channel.send({embeds: [LockMessage]});
            } catch (e) {
                const { erbed } = require('../embeds/embeds.js')
                erbed.setFooter({ text: `${error}`})
                return interaction.editReply({ embeds: [erbed] })
            }
        } else {
            interaction.editReply({content: `You don't have the required permission to run this command!`, flags: 64});
        }
    },
};