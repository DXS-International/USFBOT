const { PermissionsBitField, SlashCommandBuilder } = require('discord.js')
const { announce } = require('../modals/announceModal.js')
const { tit, desc } = require('../rows/announceRows.js')
//
module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce').setDescription('Send an announcement using the bot')
        .addChannelOption(option=>option.setName('channel').setDescription('Channel where to post the announcement').setRequired(false))
        .addMentionableOption(option=>option.setName('mention').setDescription('User/Role to mention').setRequired(false)),
    async execute(interaction) {
        if (!(interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))) {
            return interaction.reply({ content: 'Unauthorized to execute the action! Only Administrators are allowed', flags: 64 })
        }
        const channel = interaction.options.getChannel('channel') ?? interaction.channel
        const mention = interaction.options.getMentionable('mention')
        announce.setComponents(tit, desc)
        await interaction.showModal(announce)
        const filter = (interaction) => interaction.customId === 'announced';
        interaction.awaitModalSubmit({filter, time: 3600000})
        .then(interaction=> {
            interaction.reply('Announcement Text submitted successfully!')
            const TextTitle = interaction.fields.getTextInputValue('title')
            const TextDescription = interaction.fields.getTextInputValue('description')
            if (mention && TextTitle) {
                channel.send(`${mention}\n# ${TextTitle}\n${TextDescription}`);
            } else if (mention && !TextTitle) {
                channel.send(`${mention}\n${TextDescription}`)
            } else if (!mention && TextTitle) {
                channel.send(`# ${TextTitle}\n${TextDescription}`)
            } else {
                channel.send(`${TextDescription}`)
            }
            return;
        }).catch(error => {
            return interaction.reply(`There was an error while trying to get or send the announcement text!\n${error}`);
        })
    }
}