const { SlashCommandBuilder, EmbedBuilder, IntentsBitField } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource,AudioPlayerStatus } = require('@discordjs/voice');
const music = require(`../music.js`);
const YouTube = require('youtube-sr').default;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Show playlist music!')
        .addIntegerOption(opt => 
            opt.setName('page')
                .setDescription('Show select page playlist music!')
        ),
	async execute(interaction) {
        await interaction.deferReply();
        const client = interaction.client;
        const server_queuee = music.getQueue(interaction.guildId);
        let songs = null
        if (server_queuee) {
            songs = server_queuee.songs
        }
        if (!songs) {
            const embed = new EmbedBuilder()
            .setTitle('Playlista')
            // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
            .setDescription('Playlista jest pusta!')
            .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
            .setColor('Red')
            .setTimestamp();
            interaction.editReply({embeds: [embed]})
            return;
        }
        const totalPages = Math.ceil(songs.length / 10) || 1
        const page = (interaction.options.getInteger("page") || 1)

        if (page>totalPages || page<=0) {
            const embed = new EmbedBuilder()
            .setTitle('Podano nie prawidłową strone!')
            // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
            .setDescription('Playlista posiada `'+totalPages+'` strony.')
            .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
            .setColor('Red')
            .setTimestamp();
            interaction.editReply({embeds: [embed]})
            return;
        }

        const songsstring = songs.slice((page-1)*10, (page-1)*10+10).map((song, i) => {
            if (i>0) {
                return `${(page-1)*10+i}. ${song.durationFormatted} | ${song.title}`
            }
        }).join('\n')
        let ssongs = ""
        if (songsstring) {
            ssongs = `\n\nKolejka:${songsstring}`
        }
        let emebd = new EmbedBuilder()
        .setTitle('Playlista')
        // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
        .setDescription(`Aktualna piosenka:\n${songs[0].durationFormatted} | ${songs[0].title}${ssongs}`)
        .setFooter({text: interaction.member.displayName+` | Strona ${page}/${totalPages}`, iconURL: interaction.member.displayAvatarURL()})
        .setColor('Aqua')
        .setTimestamp();
        if (page>1) {
            emebd = new EmbedBuilder()
            .setTitle('Playlista')
            // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
            .setDescription(ssongs)
            .setFooter({text: interaction.member.displayName+` | Strona ${page}/${totalPages}`, iconURL: interaction.member.displayAvatarURL()})
            .setColor('Aqua')
            .setTimestamp();
        }
        interaction.editReply({embeds: [emebd]})
            return;
	},
};