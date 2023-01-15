const queue = new Map();
const loop = new Map();
const players = new Map();
const ytdl = require('ytdl-core')
const {QuickDB} = require('quick.db')
const db = new QuickDB();
const {EmbedBuilder} = require('discord.js');
const {createAudioResource, AudioPlayerStatus} = require('@discordjs/voice')

module.exports = {
    play,
    skip,
    getQueue,
    getPlayers,
    setQueue,
    setPlayers,
    delQueue,
    delPlayers,
    getLoop,
    delLoop,
    setLoop
}

async function play(guild,song,channel) {
    await video_player(guild,song,channel,"play");
};
async function skip(guild,song,channel,number) {
    video_player(guild,song,channel,"skip",number);
};
function getQueue(target) {
    return queue.get(target);
};
function getPlayers(target) {
    return players.get(target);
};
function setQueue(target, val) {
    queue.set(target, val);
};
function setPlayers(target, val) {
    players.set(target, val);
};
function delQueue(target, val) {
    queue.set(target, val);
};
function delPlayers(target, val) {
    players.set(target, val);
};

function getLoop(target) {
    return loop.get(target);
};
function delLoop(target, val) {
    loop.set(target, val);
};
function setLoop(target, val) {
    loop.set(target, val);
};


const video_player = async (guild, song,channel,type,number) => {
    const song_queue = queue.get(guild.id);
    const plr = players.get(guild.id);
        if (type=="play") {
            if (!song) {
                const embed = new EmbedBuilder()
                    // .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
                    .setTitle('Playlista')
                    .setDescription('Playlista dobiegła końca!')
                    .setColor('Red')
                    .setTimestamp();
                    channel.send({embeds: [embed]})
                    queue.delete(guild.id);
                return;
            }
            try {
                const stream = await ytdl(song.url, {filter: 'audioonly',format: 'mp3', highWaterMark: 1<<62,liveBuffer:1<62,dlChunkSize: 0});
                await players.get(guild.id).player.play(createAudioResource(stream))
                await song_queue.connection.subscribe(plr.player)
                plr.player.once(AudioPlayerStatus.Idle, async () => {
                    if (loop.get(guild.id)) {
                        if (loop.get(guild.id).loop=='0') {
                            song_queue.songs.shift();
                            video_player(guild, song_queue.songs[0],channel,"play");
                        } else if (loop.get(guild.id).loop=='2') {
                            song_queue.songs.push(song_queue.songs[0])
                            song_queue.songs.shift();
                            video_player(guild, song_queue.songs[0],channel,"play");
                        } else if (loop.get(guild.id).loop=='1') {
                            video_player(guild, song_queue.songs[0],channel,"play");
                        }
                    } else {
                        song_queue.songs.shift();
                        video_player(guild, song_queue.songs[0],channel,"play");
                    }
                });
                if (await db.get(`g.${song_queue.interaction.guildId}.showactualsong`)==true) {
                    const views = "" +  (formatter(song.views) || "...")
                        const uploadedAt = "" +  (song.uploadedAt || "...")
                        const durationFormatted = "" +  (song.durationFormatted || "...")
                        const embed = new EmbedBuilder()
                            .setAuthor({name: song.channel.name, iconURL: song.channel.iconURL(), url: song.channel.url})
                            .setTitle(song.title)
                            .setURL(song.url)
                            .setThumbnail(song.thumbnail.url)
                            .addFields({name: 'Wyświetlenia:', value: views, inline: true},
                                        {name: 'Dodano:', value: uploadedAt, inline: true},
                                        {name: 'Czas:', value: durationFormatted, inline: true},)
                            .setColor('Aqua')
                            .setFooter({text: 'Akutalna piosenka', iconURL: song_queue.interaction.author.avatarURL()})
                            .setTimestamp();
                            song_queue.interaction.channel.send({embeds: [embed]})
                }
            } catch (err) {
                console.log(err);
            }
        } else if (type==="skip") {
            if (number) {
                for (let inskip=0; inskip<number-1; inskip++) {
                    song_queue.songs.shift();
                }
                plr.player.stop();
            } else if (number==null) {
                plr.player.stop();
            }
        }
}
