const { SlashCommandBuilder, EmbedBuilder, IntentsBitField } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource,AudioPlayerStatus } = require('@discordjs/voice');
const music = require(`../music.js`);
const YouTube = require('youtube-sr').default;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Loop playlist music!')
        .addStringOption(opt => 
            opt.setName('loop')
            .setDescription('Loop type')
            .setRequired(true)
            .addChoices(
                { name: 'off', value: 'off' },
				{ name: 'song', value: 'song' },
				{ name: 'playlist', value: 'playlist' }
            )),
	async execute(interaction) {
        await interaction.deferReply();
        const client = interaction.client;
        const server_loop = music.getLoop(interaction.guildId);
        if (!server_loop) {
            music.setLoop(interaction.guildId, {
                loop: 0
            })
        }
        if (interaction.options.getString('loop')=="off") {
            music.setLoop(interaction.guildId, {
                loop: '0'
            })
            const embed = new EmbedBuilder()
            // .setTitle('Wyszukiwanie YT')
            .setTitle('Zapętlenie')
            // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
            .setDescription('Wyłączono zapętlenie!')
            .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
            .setColor('Aqua')
            .setTimestamp();
            interaction.editReply({embeds: [embed]})
            return;
        } else if (interaction.options.getString('loop')=="song") {
            music.setLoop(interaction.guildId, {
                loop: '1'
            })
            const embed = new EmbedBuilder()
            // .setTitle('Wyszukiwanie YT')
            .setTitle('Zapętlenie')
            // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
            .setDescription('Włączono zapętlenie piosenki!')
            .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
            .setColor('Aqua')
            .setTimestamp();
            interaction.editReply({embeds: [embed]})
            return;
        } else if (interaction.options.getString('loop')=="playlist") {
            music.setLoop(interaction.guildId, {
                loop: '2'
            })
            const embed = new EmbedBuilder()
            // .setTitle('Wyszukiwanie YT')
            .setTitle('Zapętlenie')
            // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
            .setDescription('Włączono zapętlenie playlisty!')
            .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
            .setColor('Aqua')
            .setTimestamp();
            interaction.editReply({embeds: [embed]})
            return;
        }
	},
};