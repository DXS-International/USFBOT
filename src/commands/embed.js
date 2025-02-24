const { ActionRowBuilder, EmbedBuilder, ModalBuilder, PermissionsBitField, SlashCommandBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
//
module.exports = {
    data: new SlashCommandBuilder()
    	.setName('embed').setDescription('Creates an embed')
    	.addStringOption(option=>option.setName('color').setDescription('Select the color of the embed').addChoices(
            { name: 'Pink', value: 'pink'},
            { name: 'Red', value: 'red'},
            { name: 'Orange', value: 'orange'},
            { name: 'Yellow', value: 'yellow'},
            { name: 'Green', value: 'green'},
            { name: 'Blue', value: 'blue'},
            { name: 'Purple', value: 'purple'},
            { name: 'Black', value: 'black'},
            { name: 'White', value: 'white'},
        ))
    	.addBooleanOption(option=>option.setName('footericon').setDescription('Should we add your avatar as footericon?'))
        .addAttachmentOption(option=>option.setName('image').setDescription('Upload an image for the embed'))
    	.setDMPermission(false),
    async execute(interaction) {
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            let color = interaction.options.getString('color') ?? 'black';
            const footericon = interaction.options.getBoolean('footericon');
            const image = interaction.options.getAttachment('image');
            const modal = new ModalBuilder()
                .setCustomId('embedResponse')
                .setTitle('Embed Options');
            const titleb = new TextInputBuilder()
                .setCustomId('title')
                .setLabel('Embed Title')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const descriptionb = new TextInputBuilder()
                .setCustomId('description')
                .setLabel('Embed Description')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
            const footerb = new TextInputBuilder()
                .setCustomId('footer')
                .setLabel('Embed Footer')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);
            const row = new ActionRowBuilder().addComponents(titleb);
            const row1 = new ActionRowBuilder().addComponents(descriptionb);
            const row2 = new ActionRowBuilder().addComponents(footerb);
            modal.addComponents(row, row1, row2);
            await interaction.showModal(modal);
            const filter = (interaction) => interaction.customId === 'embedResponse';
            interaction.awaitModalSubmit({ filter, time: 120000 })
                .then( async interaction => {
                    const title = interaction.fields.getTextInputValue('title');
                    const description = interaction.fields.getTextInputValue('description');
                    const footer = interaction.fields.getTextInputValue('footer');
                    const embed = new EmbedBuilder()
                        .setTitle(`${title}`)
        	            .setDescription(`${description}`)
        	            .setTimestamp();
                    switch (color) {
                        case 'blue': embed.setColor(0x0000ff); break;
                        case 'red': embed.setColor(0xff0000); break;
                        case 'orange': embed.setColor(0xff7700); break;
                        case 'green': embed.setColor(0x00ff00); break;
                        case 'yellow': embed.setColor(0xffff00); break;
                        case 'purple': embed.setColor(0xff00ff); break;
                        case 'black': embed.setColor(0x000001); break;
                        case 'white': embed.setColor(0xffffff); break;
                        case 'pink': embed.setColor(0xf887df); break;
                        default: embed.setColor(0x000001);
                    }
                    if (footer&&footericon) {
                        await embed.setFooter({text:`${footer}`, iconURL:`${interaction.user.displayAvatarURL({size:16})}`});
                    } else if (footer&&!footericon) {
                        await embed.setFooter({text: `${footer}`});
                    } else if (!footer&&footericon) {
                        await embed.setFooter({text: 'No Text Provided', iconURL: `${interaction.user.displayAvatarURL({size:16})}`});
                    }
                    if (image) {
                        embed.setImage(`attachment://${image.name}`);
                        interaction.channel.send({embeds: [embed], files: [image] });
                        return interaction.reply({content: 'Embed Sent', flags: 64});
                    }
                    interaction.channel.send({embeds: [embed] });
                    return interaction.reply({content: 'Embed Sent', flags: 64});
                })
                .catch(error =>{
                    console.error(error);
                });
        }
    },
};