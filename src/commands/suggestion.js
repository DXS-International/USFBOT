const {SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder}=require('discord.js');
const { suggestlog } = require('../../config.json');
//
module.exports = {
    data: new SlashCommandBuilder()
    	.setName('suggestion')
    	.setDescription('Suggest Commands or Functions for the Bot')
    	.addStringOption(option=>option.setName('type').setDescription('Suggestion Type').setRequired(true).addChoices(
            {name: 'Add Command', value: 'addCmd'},
            {name: 'Update Command', value: 'updateCmd'},
            {name: 'Add Function', value: 'addFunc'},
            {name: 'Update Function', value: 'UpdateFunc'},
        ))
    	.addStringOption(option=>option.setName('description').setDescription('Describe in detail what you want to add/change').setRequired(true))
    	.setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 })
        const type = interaction.options.getString('type');
        const description = interaction.options.getString('description');
        const ask = new EmbedBuilder()
        	.setColor(0xffff00)
        	.setTitle(`${type.toUpperCase()} Suggestion`)
        	.setDescription(`**Explaination:** ${description}\nThis is how your suggestion will be viewed to Developers.\n⚠ WARNING: If we consider your request meaningless or inappropriate we may block you from using the USF Bot. If you are sure that you want to submit this request, press the "Confirm" button below otherwise press the "Cancel button."`);
        const cancel = new ButtonBuilder()
        	.setCustomId('cancel')
        	.setLabel('Cancel')
        	.setStyle(ButtonStyle.Danger)
        	.setEmoji('⛔');
        const confirm = new ButtonBuilder()
        	.setCustomId('confirm')
        	.setLabel('Confirm')
        	.setStyle(ButtonStyle.Success)
        	.setEmoji('✅');
        const row = new ActionRowBuilder()
        	.addComponents(cancel, confirm);
        const response = await interaction.editReply({embeds: [ask], components: [row], flags: 64});
        const collectorFilter = i => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
            if (confirmation.customId==='cancel') {
                await confirmation.update({content: 'Request cancelled.', flags: 64, components: [], embeds: []});
            } else if (confirmation.customId==='confirm') {
                const worked = new EmbedBuilder()
                	.setColor(0x00ff00)
                	.setTitle('Suggestion successfully sent!')
                	.setDescription('✅ Your suggestion has been successfully deliveried to USF Developers.\nWe won\'t contact you about your suggestion unless you open a Support Ticket in our Discord Server.');
                const sugg = new EmbedBuilder()
                	.setColor(0xffff00)
                	.setTitle(`${type.toUpperCase()} Suggestion`)
                	.setDescription(`**Explaination:** ${description}`)
                	.setFooter({text: `Suggestion sent by ${interaction.user.username} | ${interaction.user.id}`, iconURL: `${interaction.user.displayAvatarURL({})}`});
                await confirmation.update({flags: 64, embeds: [worked], components: []});
                const channel = interaction.client.channels.cache.get(suggestlog)
                channel.send({embeds: [sugg]})
            }
        } catch(error) {
            console.error(error);
            await interaction.editReply({ content: 'There was an error while sending your suggestion. Please try again later.', components: [], flags: 64, embeds: [] });
        }
    }
}