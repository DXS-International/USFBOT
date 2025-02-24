const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { discord } = require('../../config.json');
const fs = require('fs')
//
module.exports = {
    data: new SlashCommandBuilder()
    	.setName('mcstatus').setDescription('Get the status of a Minecraft Server')
    	.addStringOption(option=>option.setName('address').setDescription('IP Address of the Minecraft server (without port)').setRequired(true))
    	.setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply();
        const host = interaction.options.getString('address');
        const getStatus = async () => {
            try {
                const response = await axios.get(`https://mcapi.xdefcon.com/server/${host}/full/json`);
                const status = response.data;
                return status;
            } catch (error) {
                console.error('Error during status fetch:', error);
                interaction.editReply({ content: `An error occurred while fetching the status of the requested server!\n${error}\nReport to developers through our [Discord Server]${discord}\n\nIs the server an Aternos/exaroton server? Please check [this page](https://usf.instatus.com/clpk5xl9l69900banb6k6cb9tk)`, flags: 64 });
            }
        }
        const status = await getStatus();
        if (status.serverStatus==='offline' || status.maxplayers===0) {
            const oembed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle(`${host.toLowerCase()} [OFFLINE]`)
                .setDescription(`It looks like there was an error while fetching the status of the requested server! **Common causes:**\n1. The server is offline\n2. The server is not reachable\n3. The server is not a Minecraft server\n4. The server is not using the default port\n5. The server is affected by the Aternos/exaroton issue. [Read more](https://usf.instatus.com/clpk5xl9l69900banb6k6cb9tk)`);
            return interaction.editReply({ embeds: [oembed] })
        }
        const sembed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`${host.toLowerCase()} [ONLINE]`)
            .addFields(
                { name: 'Players', value: `${status.players}/${status.maxplayers}`, inline: true },
                { name: 'Version', value: `${status.version}`, inline: true },
                { name: 'Protocol', value: `${status.protocol}`, inline: true },
            )
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: `${interaction.user.displayAvatarURL({size:32})}`})
            .setTimestamp();
        if (status.motd.extra) {
             let desc = ''
            if (!(status.motd.extra[1])) {
                for (let i=0; i<status.motd.extra[0].extra.length; i++) {
                    desc+=status.motd.extra[0].extra[i].text;
                }
            } else {
                if (!(status.motd.extra[1].extra)) {
                    desc = status.motd.text;
                } else {
                    for (let i=0; i<status.motd.extra[1].extra.length; i++) {
                        desc+=status.motd.extra[1].extra[i].text;
                    }
                }
            }
            if (!desc) { desc = 'No description found' }
            sembed.setDescription(`${desc}`)
        } else {
            sembed.setDescription(`${status.motd.text}`)
        }
        interaction.editReply({ embeds: [sembed] });
    },
};