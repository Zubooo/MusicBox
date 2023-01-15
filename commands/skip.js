const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource,AudioPlayerStatus } = require('@discordjs/voice');
const music = require(`../music.js`);
const YouTube = require('youtube-sr').default;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip music in playlist!')
        .addIntegerOption(opt => 
            opt.setName('song')
                .setDescription('Count songs to skip!')
        ),
	async execute(interaction) {
        await interaction.deferReply();
        const server_queuee = music.getQueue(interaction.guildId);
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
        if (interaction.options.getInteger("song")) {
            if (parseInt(interaction.options.getInteger("song"))) {
                // video_player(message.guild,null,message.channel,message.channel.id,"skip",parseInt(args[0]))
                await music.skip(interaction.guild,null,interaction.channel,interaction.options.getInteger("song"))
                const embed = new EmbedBuilder()
                .setTitle('Playlista')
                // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
                .setDescription(`Pominięto \`${interaction.options.getInteger("song")}\` piosenki!`)
                .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
                .setColor('Aqua')
                .setTimestamp();
                interaction.editReply({embeds: [embed]})
                return;
            } else {
                const embed = new EmbedBuilder()
                .setTitle('Playlista')
                // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
                .setDescription(`Podaj ilość piosenek które mam pominąć!`)
                .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
                .setColor('Red')
                .setTimestamp();
                interaction.editReply({embeds: [embed]})
            }
        } else if (!interaction.options.getInteger("song")){
            await music.skip(interaction.guild,null,interaction.channel,null)
            const embed = new EmbedBuilder()
            .setTitle('Playlista')
            // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
            .setDescription(`Pominięto piosenke: ${songs[0].title}`)
            .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
            .setColor('Aqua')
            .setTimestamp();
            interaction.editReply({embeds: [embed]})
            return;
        }
    }
}