const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require('parse-ms');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uptime')
		.setDescription('Show uptime bot!'),
	async execute(interaction) {
        await interaction.deferReply();
        const client = interaction.client;

        const time = ms(client.uptime)
        let timestr = time.seconds + 's';
        if (time.minutes > 0) timestr = time.minutes + 'm, ' +timestr
        if (time.hours > 0) timestr = time.hours + 'h, ' +timestr
        if (time.days > 0) timestr = time.days + 'h, ' +timestr

        const embed = new EmbedBuilder()
        .setColor('Aqua')
        .setTitle('Bot')
        .setDescription(`Online od: ${timestr}`)
        // .setTimestamp();
		await interaction.editReply({embeds: [embed]});
	},
};