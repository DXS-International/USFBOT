const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { reportlog } = require('../../config.json');
//
module.exports = {
    data: new SlashCommandBuilder()
        .setName('report').setDescription('Report an user or a Bot issue/bug')
        .addStringOption(option=>option.setName('type').setDescription('What are you reporting? choose an option').setRequired(true).addChoices(
            { name: 'Discord User', value: 'user' },
            { name: 'Bot Issue/Bug', value: 'bot' },
        ))
        .addStringOption(option=>option.setName('description').setDescription('Informations about your report').setRequired(true))
        .addAttachmentOption(option=>option.setName('proof').setDescription('Proof about your report'))
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 })
        const type = interaction.options.getString('type')
        const text = interaction.options.getString('description')
        const proof = interaction.options.getAttachment('proof')
        let report = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle(`${type.toUpperCase()} Report`)
            .setDescription(`**Informations: **${text}`)
            .setFooter({text: `Report sent by ${interaction.user.username} | ${interaction.user.id}`, iconURL: `${interaction.user.displayAvatarURL({})}`});
        let confirmation = new EmbedBuilder()
        	.setColor(0xff0000)
        	.setTitle(`${type.toUpperCase()} Report`)
        	.setDescription(`**Description: **${text}\n⚠ WARNING: If we consider your report meaningless or inappropriate we can block you from using the Bot.\n If you are sure about your report, please press the "Confirm" button below otherwise press the "Cancel" Button.`);
        const no = new ButtonBuilder()
        	.setCustomId('cancelled')
        	.setLabel('Cancel')
        	.setStyle(ButtonStyle.Danger)
        	.setEmoji('⛔');
        const yes = new ButtonBuilder()
        	.setCustomId('confirmed')
        	.setLabel('Confirm')
        	.setStyle(ButtonStyle.Success)
        	.setEmoji('✅');
        const row = new ActionRowBuilder()
        	.addComponents(no, yes);
        const message = await interaction.editReply({ embeds: [confirmation], components: [row], ephemeral: true })
        try {
            const confirmer = await message.awaitMessageComponent({ time: 60000 })
            if (confirmer.customId === 'cancelled') {
                confirmation.setColor(0xff0000).setTitle('USFBot Report System').setDescription('Request Cancelled');
                return interaction.editReply({ embeds: [confirmation], components: [] })
            } else if (confirmer.customId === 'confirmed') {
                interaction.editReply('Sending Request...')
            }
        } catch (error) {
            console.error(error)
            return interaction.editReply({ content: `We are sorry, an error occurred. Please report this to Developers\n${error}`, embeds: [], components: [] })
        }
        const reportch = interaction.client.channels.cache.get(reportlog);
        if (proof) {
            report.setImage(`attachment://${proof.name}`)
            reportch.send({ embeds: [report], files: [proof] })
            confirmation.setColor(0x00ff00).setTitle('USFBot Report System').setDescription('Request Registred');
            return interaction.editReply({ content: '', embeds: [confirmation], components: [], ephemeral: true })
        } else {
            reportch.send({ embeds: [report] })
            confirmation.setColor(0x00ff00).setTitle('USFBot Report System').setDescription('Request Registred');
            return interaction.editReply({ content: '', embeds: [confirmation], components: [], ephemeral: true })
        }

    }
}