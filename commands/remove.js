const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource,AudioPlayerStatus } = require('@discordjs/voice');
const music = require(`../music.js`);
const YouTube = require('youtube-sr').default;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Skip music in playlist!')
        .addIntegerOption(opt => 
            opt.setName('songs')
                .setDescription('Numer songs to remove!')
                .setRequired(true)
        ),
	async execute(interaction) {
        await interaction.deferReply();
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
        if (interaction.options.getInteger("songs")+1>1) {
            // const delsongindex = server_queuee.songs.indexOf(parseInt(args[0])+1);
            // if (delsongindex > -1) {
                if (server_queuee.songs[interaction.options.getInteger("songs")]) {
                    const embed = new EmbedBuilder()
                    .setTitle('Playlista')
                    // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
                    .setDescription(`Usunięto piosenke: ${songs[interaction.options.getInteger("songs")].title}`)
                    .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
                    .setColor('Aqua')
                    .setTimestamp();
                    interaction.editReply({embeds: [embed]})
                    music.getQueue(interaction.guildId).songs.splice(interaction.options.getInteger("songs"),1);
                } else {
                    const embed = new EmbedBuilder()
                    .setTitle('Playlista')
                    // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
                    .setDescription(`Nie znaleziono piosenki o takim numerze!`)
                    .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
                    .setColor('Red')
                    .setTimestamp();
                    interaction.editReply({embeds: [embed]})
                }
            // }
        } else {
            const embed = new EmbedBuilder()
                .setTitle('Playlista')
                // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
                .setDescription(`Podaj numer piosenki którą mam usunąć z playlisty!`)
                .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
                .setColor('Red')
                .setTimestamp();
                interaction.editReply({embeds: [embed]})
        }
    }
}