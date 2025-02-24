const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
//
module.exports = {
    data: new SlashCommandBuilder()
    	.setName('poll')
    	.setDescription('Create a poll in the server, max 10 options')
    	.addStringOption(option=>option.setName('message').setDescription('Message').setRequired(true))
    	.addStringOption(option=>option.setName('option1').setDescription('Option 1').setRequired(true))
    	.addStringOption(option=>option.setName('option2').setDescription('Option 2').setRequired(true))
    	.addStringOption(option=>option.setName('option3').setDescription('Option 3'))
    	.addStringOption(option=>option.setName('option4').setDescription('Option 4'))
    	.addStringOption(option=>option.setName('option5').setDescription('Option 5'))
        .addStringOption(option=>option.setName('option6').setDescription('Option 6'))
        .addStringOption(option=>option.setName('option7').setDescription('Option 7'))
        .addStringOption(option=>option.setName('option8').setDescription('Option 8'))
        .addStringOption(option=>option.setName('option9').setDescription('Option 9'))
        .addStringOption(option=>option.setName('option10').setDescription('Option 10'))
    	.setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({flags: 64});
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const message = interaction.options.getString('message');
            const option1 = interaction.options.getString('option1');
            const option2 = interaction.options.getString('option2');
            const option3 = interaction.options.getString('option3');
            const option4 = interaction.options.getString('option4');
            const option5 = interaction.options.getString('option5');
            const option6 = interaction.options.getString('option6');
            const option7 = interaction.options.getString('option7');
            const option8 = interaction.options.getString('option8');
            const option9 = interaction.options.getString('option9');
            const option10 = interaction.options.getString('option10');
            const poll = new EmbedBuilder()
            	.setColor(0xff0000)
            	.setTitle(`${message}`)
            	.setThumbnail(`${interaction.guild.iconURL({size:2048})}`)
            	.setFooter({text: `Requested by ${interaction.user.username}`, iconURL: `${interaction.user.displayAvatarURL({size:32})}`})
            	.setTimestamp();
            let options;
            if (option10) {
                options=10
                poll.setDescription(`- 1️⃣ ${option1}\n- 2️⃣ ${option2}\n- 3️⃣ ${option3}\n- 4️⃣ ${option4}\n- 5️⃣ ${option5}\n- 6️⃣ ${option6}\n- 7️⃣ ${option7}\n- 8️⃣ ${option8}\n- 9️⃣ ${option9}\n- 🔟 ${option10}`);
            } else if (option9) {
                options=9
                poll.setDescription(`- 1️⃣ ${option1}\n- 2️⃣ ${option2}\n- 3️⃣ ${option3}\n- 4️⃣ ${option4}\n- 5️⃣ ${option5}\n- 6️⃣ ${option6}\n- 7️⃣ ${option7}\n- 8️⃣ ${option8}\n- 9️⃣ ${option9}`);
            } else if (option8) {
                options=8
                poll.setDescription(`- 1️⃣ ${option1}\n- 2️⃣ ${option2}\n- 3️⃣ ${option3}\n- 4️⃣ ${option4}\n- 5️⃣ ${option5}\n- 6️⃣ ${option6}\n- 7️⃣ ${option7}\n- 8️⃣ ${option8}`);
            } else if (option7) {
                options=7
                poll.setDescription(`- 1️⃣ ${option1}\n- 2️⃣ ${option2}\n- 3️⃣ ${option3}\n- 4️⃣ ${option4}\n- 5️⃣ ${option5}\n- 6️⃣ ${option6}\n- 7️⃣ ${option7}`);
            } else if (option6) {
                options=6
                poll.setDescription(`- 1️⃣ ${option1}\n- 2️⃣ ${option2}\n- 3️⃣ ${option3}\n- 4️⃣ ${option4}\n- 5️⃣ ${option5}\n- 6️⃣ ${option6}`);
            } else if (option5) {
                options=5
                poll.setDescription(`- 1️⃣ ${option1}\n- 2️⃣ ${option2}\n- 3️⃣ ${option3}\n- 4️⃣ ${option4}\n- 5️⃣ ${option5}`);
            } else if (option4) {
                options=4
                poll.setDescription(`- 1️⃣ ${option1}\n- 2️⃣ ${option2}\n- 3️⃣ ${option3}\n- 4️⃣ ${option4}`);
            } else if (option3) {
                options=3
                poll.setDescription(`- 1️⃣ ${option1}\n- 2️⃣ ${option2}\n- 3️⃣ ${option3}`);
            } else {
                options=2
                poll.setDescription(`- 1️⃣ ${option1}\n- 2️⃣ ${option2}`);
            }
            interaction.editReply({content: 'Poll sent!', ephemeral: true});
            const reply = await interaction.channel.send({embeds: [poll], fetchReply: true});
            reply.react('1️⃣');
            reply.react('2️⃣');
            switch (options) {
                case 10: reply.react('3️⃣'); reply.react('4️⃣'); reply.react('5️⃣'); reply.react('6️⃣'); reply.react('7️⃣'); reply.react('8️⃣'); reply.react('9️⃣'); reply.react('🔟'); break;
                case 9: reply.react('3️⃣'); reply.react('4️⃣'); reply.react('5️⃣'); reply.react('6️⃣'); reply.react('7️⃣'); reply.react('8️⃣'); reply.react('9️⃣'); break;
                case 8: reply.react('3️⃣'); reply.react('4️⃣'); reply.react('5️⃣'); reply.react('6️⃣'); reply.react('7️⃣'); reply.react('8️⃣'); break;
                case 7: reply.react('3️⃣'); reply.react('4️⃣'); reply.react('5️⃣'); reply.react('6️⃣'); reply.react('7️⃣'); break;
                case 6: reply.react('3️⃣'); reply.react('4️⃣'); reply.react('5️⃣'); reply.react('6️⃣'); break;
                case 5: reply.react('3️⃣'); reply.react('4️⃣'); reply.react('5️⃣'); break;
                case 4: reply.react('3️⃣'); reply.react('4️⃣'); break;
                case 3: reply.react('3️⃣'); break;
                default: break;
            }
            return;
        } else {
            const noperm = new EmbedBuilder()
            	.setColor(0xff0000)
            	.setTitle('Missing permission')
            	.setDescription('I\'m sorry, you don\'t have the required permission to run this command (Administrator)');
            return interaction.editReply({embeds:[noperm], ephemeral: true});
        }
    },
};