const fs = require('node:fs')
const path = require('node:path')
const { ActivityType, Client, Collection, EmbedBuilder, Events, GatewayIntentBits } = require('discord.js')
const { token, bannedGuilds, bannedUsers, joinlog, leavelog } = require('./config.json')
const client = new Client({ 
    intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.DirectMessages ], 
    presence: {
        status: 'ONLINE', 
        activities: [{ type: ActivityType.Playing, name: '/info'} 

    ]} 
});
client.cooldowns = new Collection();
client.commands = new Collection();
//
const foldersPath = path.join(__dirname, 'src');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
	}
}
//
client.once(Events.ClientReady, () => {
    console.log(`Client Logged in as ${client.user.tag}!\nServices working as expected\n\n`);
})
//
client.on(Events.InteractionCreate, async interaction => {
    if (bannedUsers.includes(interaction.user.id)) {
        return;
    }
    if (interaction.guild) {
        if (bannedGuilds.includes(interaction.guild.id)) {
            return;
        }
    }
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    //

    const { cooldowns } = client;
    if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Collection());
    }
    const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const defaultCooldownDuration = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;
    //
    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        if (now<expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1000);
            interaction.reply({ content: `Please wait <t:${expiredTimestamp}:R> more second(s)`, ephemeral: true });
            return;
        }
    }

    //

    timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const { erbed } = require('./src/embeds/index-embeds.js')
        erbed.setFooter(`${error}`)
        if (interaction.replied) {
            interaction.editReply({ embeds: [erbed], ephemeral: true })
        } else {
            interaction.reply({ embeds: [erbed], ephemeral: true })
        }
    }
})
//
client.on(Events.GuildCreate, guild => {
    const joinch = client.channels.cache.get(joinlog)
    const { joinEmbed } = require('./src/embeds/index-embeds.js')
    	joinEmbed.addFields(
      		{ name: 'Server name', value: `${guild.name}` },
      		{ name: '\u200B', value: '\u200B' },
      		{ name: 'Members', value: `${guild.memberCount}`, inline: true },
      		{ name: 'ID', value: `${guild.id}`, inline: true },
      		{ name: 'GuildsCount', value: `${client.guilds.cache.size}`, inline: true },
    	).setTimestamp();
    if (guild.icon) {
        joinEmbed.setThumbnail(`${guild.iconURL({ size: 2048 }) }`);
    }
    joinch.send({embeds:[joinEmbed]});
    if (bannedGuilds.includes(guild.id)) {
        guild.leave()
        joinch.send('This Guild is blacklisted. The Bot left the guild.')
    }
});
client.on(Events.GuildDelete, async guild => {
    if (client.isReady()) {
        const leavech = await client.channels.fetch(leavelog);
        const { leaveEmbed } = require('./src/embeds/index-embeds.js')
        leaveEmbed.addFields(
                { name: 'Server Name', value: `${guild.name}`},
                { name: '\u200B', value: '\u200B' },
                { name: 'Members', value: `${guild.memberCount}`, inline: true },
                { name: 'ID', value: `${guild.id}`, inline: true },
                { name: 'GuildsCount', value: `${client.guilds.cache.size}`, inline: true },
    	    ).setTimestamp();
        if (guild.icon) {
            leaveEmbed.setThumbnail(`${guild.iconURL({ size: 2048 }) }`)
        }
        leavech.send({ embeds: [leaveEmbed] })
    }
});
process.on('unhandledRejection', console.error)
process.on('uncaughtException', console.error)
client.login(token)