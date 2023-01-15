const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource,AudioPlayerStatus } = require('@discordjs/voice');
const music = require(`../music.js`);
const YouTube = require('youtube-sr').default;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play YouTube music!')
        .addStringOption(opt => 
            opt.setName('search')
                .setDescription('Search in YouTube!')
                .setRequired(true)
        ),
	async execute(interaction) {
        await interaction.deferReply();
        const client = interaction.client;
		const vc = interaction.member.voice.channelId
        if (!vc) {
            const embed = new EmbedBuilder()
            .setTitle('Dołączanie')
            .setDescription('Nie znajdujesz się na kanale głosowym!')
            .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
            .setColor('Red')
            .setTimestamp();
            interaction.editReply({embeds: [embed]});
            return;
        }

        if (!interaction.member.voice.channel.permissionsFor(client.user).has('Connect')) {
            const embed = new EmbedBuilder()
                .setTitle('Permisja')
                .setDescription("Nie posiadam permisji do połączenia z <#"+interaction.member.voice.channelId+">!")
                .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
                .setColor('Red')
                .setTimestamp();
                interaction.editReply({embeds: [embed]})
                return;
        }
        if (!interaction.member.voice.channel.permissionsFor(client.user).has('Speak')) {
            const embed = new EmbedBuilder()
                .setTitle('Permisja')
                .setDescription("Nie posiadam permisji do odtwarzania dźwięku na <#"+interaction.member.voice.channelId+">!")
                .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
                .setColor('Red')
                .setTimestamp();
                interaction.editReply({embeds: [embed]})
                return;
        }
        if (!interaction.options.getString('search')) {
            const embed = new EmbedBuilder()
            .setTitle('Wyszukiwanie YT')
            .setDescription('Podaj nazwe/link/playliste')
            .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
            .setColor('Red')
            .setTimestamp();
            interaction.editReply({embeds: [embed]});
            return;
        }

        const server_queue = music.getQueue(interaction.guildId.toString());
		const connection = joinVoiceChannel({
			channelId: interaction.member.voice.channelId,
			guildId: interaction.guildId,
			adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator,
		});

        client.on('voiceStateUpdate', (old, newstate) => {
            if (old.channelId && !newstate.channelId) {
                if (newstate.id === client.user.id) {
                    const server_player = music.getPlayers(newstate.guild.id.toString());
                    server_player.player.removeAllListeners(AudioPlayerStatus.Idle);
                    server_player.player.stop();
                    music.delQueue(newstate.guild.id.toString());
                    client.removeAllListeners('voiceStateUpdate');
                }
            }
        })

        if (interaction.options.getString('search').includes('https://www.youtube.com/watch?v=') || interaction.options.getString('search').includes('https://youtu.be/')) {
            YouTube.getVideo(interaction.options.getString('search')).then(async v=> {
                console.log(interaction.options.getString('search'))
                if (v.live) {
                    const embed = new EmbedBuilder()
                    .setTitle('Wyszukiwanie YT')
                    // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
                    .setDescription('Nie można odtworzyć live!')
                    .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
                    .setColor('Red')
                    .setTimestamp();
                    interaction.editReply({embeds: [embed]});
                    return;
                }
                v.request = interaction.member;
                if (!music.getQueue(interaction.guildId.toString())){
    
                    const queue_constructor = {
                        interaction: interaction,
                        voice_channel: interaction.member.voice.channel,
                        text_channel: interaction.channel,
                        connection: null,
                        songs: []
                    }
                    //Add our key and value pair into the global queue. We then use this to get our server queue.
                    music.setQueue(interaction.guildId.toString(), queue_constructor);
                    queue_constructor.songs.push(v);
                    // queue_constructor.songs.find
        
                    //Establish a connection and play the song with the vide_player function.
                    try{
                        queue_constructor.connection = connection;
                        await music.play(interaction.guild, queue_constructor.songs[0], interaction.channel);
                        const views = "" +  (formatter(v.views) || "...")
                        const uploadedAt = "" +  (v.uploadedAt || "...")
                        const durationFormatted = "" +  (v.durationFormatted || "...")
                        const embed = new EmbedBuilder()
                        .setAuthor({name: v.channel.name, iconURL: v.channel.iconURL(), url: v.channel.url})
                        .setTitle(v.title)
                        .setURL(v.url)
                        .setThumbnail(v.thumbnail.url)
                        .addFields({name: 'Wyświetlenia:', value: views, inline: true},
                                    {name: 'Dodano:', value: uploadedAt, inline: true},
                                    {name: 'Czas:', value: durationFormatted, inline: true},)
                        // .addFields({name: 'Dodano:', value: v.uploadedAt, inline: true})
                        .setColor('Aqua')
                        .setFooter({text: 'Dodano do playlisty', iconURL: interaction.member.displayAvatarURL()})
                        .setTimestamp();
                        interaction.editReply({embeds: [embed]});
                       return;
                    } catch (err) {
                        // music.delQueue(message.guild.id);
                        const embed = new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription(err)
                        .setColor('Red')
                        .setTimestamp();
                        interaction.editReply({content: "",embeds: [embed]});
                        throw err;
                        return;
                    }
                } else{
                    music.getQueue(interaction.guildId.toString()).songs.push(v);
                    const views = "" +  (formatter(v.views) || "...")
                    const uploadedAt = "" +  (v.uploadedAt || "...")
                    const durationFormatted = "" +  (v.durationFormatted || "...")
                    const embed = new EmbedBuilder()
                        .setAuthor({name: v.channel.name, iconURL: v.channel.iconURL(), url: v.channel.url})
                        .setTitle(v.title)
                        .setURL(v.url)
                        .setThumbnail(v.thumbnail.url)
                        .addFields({name: 'Wyświetlenia:', value: views, inline: true},
                                    {name: 'Dodano:', value: uploadedAt, inline: true},
                                    {name: 'Czas:', value: durationFormatted, inline: true},)
                        // .addFields({name: 'Dodano:', value: v.uploadedAt, inline: true})
                        .setColor('Aqua')
                        .setFooter({text: 'Dodano do playlisty', iconURL: interaction.member.displayAvatarURL()})
                        .setTimestamp();
                        interaction.editReply({embeds: [embed]});
                        return;
                }
                return;
            }).catch((res) => {
                const embed = new EmbedBuilder()
                .setTitle('Wyszukiwanie YT')
                // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
                .setDescription('Nie znaleziono takiego filmiku!')
                .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
                .setColor('Red')
                .setTimestamp();
                interaction.editReply({embeds: [embed]});
                return;
            })
        } else if (interaction.options.getString('search').includes('https://www.youtube.com/playlist?list=')) {
            let playlisttime = 0
            const playlistyt = await YouTube.getPlaylist(interaction.options.getString('search'), {fetchAll: true})
            YouTube.getPlaylist(interaction.options.getString('search'), {fetchAll: true}).then(async vv => {
                let inaa = 0
                for (const v of vv) {
                    if (v.live) {
                        return;
                    }
                    v.request = interaction.author;
                    const server_queuee = music.getQueue(interaction.guildId);
                    if (!server_queuee){
    
                        const queue_constructor = {
                            interaction: interaction,
                            voice_channel: interaction.member.voice.channel,
                            text_channel: interaction.channel,
                            connection: null,
                            songs: []
                        }
                        //Add our key and value pair into the global queue. We then use this to get our server queue.
                        music.setQueue(interaction.guildId.toString(), queue_constructor);
                        queue_constructor.songs.push(v);
            
                        //Establish a connection and play the song with the vide_player function.
                            queue_constructor.connection = connection;
                            await music.play(interaction.guild, queue_constructor.songs[0], interaction.channel);
                            playlisttime = playlisttime + v.duration;
                    } else{
                        music.getQueue(interaction.guildId).songs.push(v);
                        playlisttime = playlisttime + v.duration;
                    }
                }
                const embed = new EmbedBuilder()
                .setAuthor({name: playlistyt.channel.name, iconURL: playlistyt.channel.iconURL, url: playlistyt.channel.url})
                .setTitle(playlistyt.title)
                .setURL(playlistyt.url)
                .setThumbnail(playlistyt.thumbnail.displayThumbnailURL())
                .addFields({name: 'Ilość piosenek:', value: playlistyt.videoCount.toString(), inline: true},
                            // {name: 'Dodano:', value: playlistyt.lastUpdate, inline: true},
                            {name: 'Czas:', value: seconds2time(playlisttime/1000), inline: true},)
                // .addFields({name: 'Dodano:', value: v.uploadedAt, inline: true})
                .setColor('Aqua')
                .setFooter({text: 'Dodano piosenki do playlisty', iconURL: interaction.member.displayAvatarURL()})
                .setTimestamp();
                interaction.editReply({embeds: [embed]})
            }).catch((res) => {
                const embed = new EmbedBuilder()
                .setTitle('Wyszukiwanie YT')
                // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
                .setDescription('Nie znaleziono takiej playlisty!')
                .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
                .setColor('Red')
                .setTimestamp();
                interaction.editReply({embeds: [embed]})
            })
    } else if (!interaction.options.getString('search').includes('https://www.youtube.com/watch?v=') && !interaction.options.getString('search').includes('https://youtu.be/') && !interaction.options.getString('search').includes('https://www.youtube.com/playlist?list=')) {
        YouTube.searchOne(interaction.options.getString('search')).then(async v=> {
            if (v.live) {
                const embed = new EmbedBuilder()
                .setTitle('Wyszukiwanie YT')
                // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
                .setDescription('Nie można odtworzyć live!')
                .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
                .setColor('Red')
                .setTimestamp();
                interaction.editReply({embeds: [embed]});
                return;
            }
            v.request = interaction.member;
            if (!music.getQueue(interaction.guildId.toString())){

                const queue_constructor = {
                    interaction: interaction,
                    voice_channel: interaction.member.voice.channel,
                    text_channel: interaction.channel,
                    connection: null,
                    songs: []
                }
                //Add our key and value pair into the global queue. We then use this to get our server queue.
                music.setQueue(interaction.guildId.toString(), queue_constructor);
                queue_constructor.songs.push(v);
                // queue_constructor.songs.find
    
                //Establish a connection and play the song with the vide_player function.
                try{
                    queue_constructor.connection = connection;
                    await music.play(interaction.guild, queue_constructor.songs[0], interaction.channel);
                    const views = "" +  (formatter(v.views) || "...")
                    const uploadedAt = "" +  (v.uploadedAt || "...")
                    const durationFormatted = "" +  (v.durationFormatted || "...")
                    const embed = new EmbedBuilder()
                    .setAuthor({name: v.channel.name, iconURL: v.channel.iconURL(), url: v.channel.url})
                    .setTitle(v.title)
                    .setURL(v.url)
                    .setThumbnail(v.thumbnail.url)
                    .addFields({name: 'Wyświetlenia:', value: views, inline: true},
                                {name: 'Dodano:', value: uploadedAt, inline: true},
                                {name: 'Czas:', value: durationFormatted, inline: true},)
                    // .addFields({name: 'Dodano:', value: v.uploadedAt, inline: true})
                    .setColor('Aqua')
                    .setFooter({text: 'Dodano do playlisty', iconURL: interaction.member.displayAvatarURL()})
                    .setTimestamp();
                    interaction.editReply({embeds: [embed]});
                   return;
                } catch (err) {
                    // music.delQueue(message.guild.id);
                    const embed = new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription(err)
                    .setColor('Red')
                    .setTimestamp();
                    interaction.editReply({content: "",embeds: [embed]});
                    throw err;
                    return;
                }
            } else{
                music.getQueue(interaction.guildId.toString()).songs.push(v);
                const views = "" +  (formatter(v.views) || "...")
                const uploadedAt = "" +  (v.uploadedAt || "...")
                const durationFormatted = "" +  (v.durationFormatted || "...")
                const embed = new EmbedBuilder()
                    .setAuthor({name: v.channel.name, iconURL: v.channel.iconURL(), url: v.channel.url})
                    .setTitle(v.title)
                    .setURL(v.url)
                    .setThumbnail(v.thumbnail.url)
                    .addFields({name: 'Wyświetlenia:', value: views, inline: true},
                                {name: 'Dodano:', value: uploadedAt, inline: true},
                                {name: 'Czas:', value: durationFormatted, inline: true},)
                    // .addFields({name: 'Dodano:', value: v.uploadedAt, inline: true})
                    .setColor('Aqua')
                    .setFooter({text: 'Dodano do playlisty', iconURL: interaction.member.displayAvatarURL()})
                    .setTimestamp();
                    interaction.editReply({embeds: [embed]});
                    return;
            }
            return;
            }).catch((res) => {
                const embed = new EmbedBuilder()
                .setTitle('Wyszukiwanie YT')
                // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
                .setDescription('Nie znaleziono takiego filmiku!')
                .setFooter({text: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL()})
                .setColor('Red')
                .setTimestamp();
                interaction.editReply({embeds: [embed]})
            })
        }




	},
};

var SI_SYMBOL = ["", "k", "M", "T", "B"];
function formatter(number){
    var tier = Math.log10(Math.abs(number)) / 3 | 0;
    if(tier == 0) return number;
    var suffix = SI_SYMBOL[tier];
    var scale = Math.pow(10, tier * 3);
    var scaled = number / scale;
    return scaled.toFixed(1) + suffix;
}

function seconds2time (seconds) {
    var hours   = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds - (hours * 3600)) / 60);
    var seconds = seconds - (hours * 3600) - (minutes * 60);
    var time = "";

    if (hours != 0) {
      time = hours+":";
    }
    if (minutes != 0 || time !== "") {
      minutes = (minutes < 10 && time !== "") ? "0"+minutes : String(minutes);
      time += minutes+":";
    }
    if (time === "") {
      time = seconds+"s";
    }
    else {
      time += (seconds < 10) ? "0"+seconds : String(seconds);
    }
    return time;
}