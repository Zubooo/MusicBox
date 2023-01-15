const { SlashCommandBuilder, EmbedBuilder, IntentsBitField } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource,AudioPlayerStatus } = require('@discordjs/voice');
const music = require(`../music.js`);
const YouTube = require('youtube-sr').default;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clear playlist music!'),
	async execute(interaction) {
        await interaction.deferReply();
        const client = interaction.client;
        const server_queuee = music.getQueue(interaction.guildId);
        const server_player = music.getPlayers(interaction.guildId);
        let songs = null
        if (server_queuee) {
            songs = server_queuee.songs
        }
        if (!songs) {
            const embed = new EmbedBuilder()
            // .setTitle('Wyszukiwanie YT')
            .setTitle('Playlista')
            // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
            .setDescription('Playlista jest pusta!')
            .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
            .setColor('Red')
            .setTimestamp();
            interaction.editReply({embeds: [embed]})
            return;
        }
        if (server_queuee) {
            songs = server_queuee.songs
        }
        songs.forEach(() => {
            songs.shift()
        })
        server_player.player.removeAllListeners(AudioPlayerStatus.Idle);
        music.delQueue(interaction.guildId);
        server_player.player.stop();
        const embed = new EmbedBuilder()
            .setTitle('Playlista')
            // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
            .setDescription('Wyczyszczono playliste!')
            .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
            .setColor('Aqua')
            .setTimestamp();
            interaction.editReply({embeds: [embed]})
            return;
	},
};