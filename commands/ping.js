const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Show latency!'),
	async execute(interaction) {
        await interaction.deferReply();
        const client = interaction.client;
        const embed = new EmbedBuilder()
        .setColor('Aqua')
        .setTitle('Opóźnienie')
        .addFields(
            {name: 'Bot:', value: client.ws.ping.toString() + "ms" ,inline: true},
            {name: 'Discord API:', value: (Date.now() - interaction.createdTimestamp).toString() + "ms" ,inline: true}
        )
        // .setTimestamp();
		await interaction.editReply({embeds: [embed]});
	},
};