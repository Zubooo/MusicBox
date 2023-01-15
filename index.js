const {Client,GatewayIntentBits,ActivityType, EmbedBuilder, Collection, Events} = require('discord.js');
const { createAudioPlayer} = require('@discordjs/voice');
const fs = require('node:fs');
const path = require('node:path');
const path = require('parse-ms');
const {QuickDB} = require('quick.db')
const db = new QuickDB();
require('dotenv').config();
const music = require(`./music.js`);

const client = new Client({intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent
]});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
	console.log(`Zalogowano jako ${client.user.tag}`);
    client.user.setActivity({type: ActivityType.Listening, name:' YouTube Music'})
});

client.on('guildCreate', g => {
    const gid = g.id;
    if (!db.has(`g.${gid}`)) {
        db.set(`g.${gid}`, {prefix: ">>"})
        db.set(`g.${gid}.showactualsong`,false)
    }
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

    const server_player = music.getPlayers(interaction.guildId.toString())
    if (!server_player) {
        console.log('1')
        music.setPlayers(interaction.guildId.toString(),{
            test: "test",
            player: createAudioPlayer()
        })
    }
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.login(process.env.TOKEN);