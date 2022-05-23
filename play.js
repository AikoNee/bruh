const { Util, MessageEmbed, Permissions } = require("discord.js");
const { TrackUtils, Player } = require("erela.js");
const { convertTime } = require('../../utils/convert.js');

module.exports = {
    name: "play",
    category: "Music",
    aliases: ["p"],
    description: "Plays audio from YouTube or Soundcloud",
    args: true,
    usage: "<YouTube URL | Video Name | Spotify URL>",
    permission: [],
    owner: false,
    player: false,
    inVoiceChannel: true,
    sameVoiceChannel: true,
   execute: async (message, args, client, prefix) => {
    
    if (!message.guild.me.permissions.has([Permissions.FLAGS.CONNECT, Permissions.FLAGS.SPEAK])) return message.channel.send({embeds: [new MessageEmbed().setColor(client.embedColor).setDescription(`I don't have enough permissions to execute this command! please give me permission \`CONNECT\` or \`SPEAK\`.`)]});
    
    const { channel } = message.member.voice;
   
    if (!message.guild.me.permissionsIn(channel).has([Permissions.FLAGS.CONNECT, Permissions.FLAGS.SPEAK])) return message.channel.send({embeds: [new MessageEmbed().setColor(client.embedColor).setDescription(`I don't have enough permissions connect your vc please give me permission \`CONNECT\` or \`SPEAK\`.`)]});
   
    let SearchString = args.join(" ");
    const emojiaddsong = message.client.emoji.addsong;
    const emojiplaylist = message.client.emoji.playlist;
    const spotii = client.emojis.cache.get('959495146922209381');

    if(SearchString.startsWith("https://open.spotify.com/playlist/")) message.channel.send({ embeds: [new MessageEmbed().setAuthor({name:`Spotify`,iconURL:"https://media.discordapp.net/attachments/964028389688246344/975725010889105418/emoji.png"})
    .setThumbnail("https://media.discordapp.net/attachments/733239473214586921/911218908852273172/diona-relax.gif").setColor(client.embedColor).setTimestamp().setDescription(`Playlist is loading, please wait...`)]}).then(msg => { setTimeout(() => {msg.delete()}, 3000);
       })
       
    const player = client.manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: true,
      volume: 80,
    });
    
    if (player.state != "CONNECTED") await player.connect();
    try {
      if (SearchString.match(client.Lavasfy.spotifyPattern)) {
        await client.Lavasfy.requestToken();
        let node = client.Lavasfy.nodes.get(client.config.nodes.id);
        let Searched = await node.load(SearchString);
      if (Searched.loadType === "PLAYLIST_LOADED") {
          let songs = [];
         for (let i = 0; i < Searched.tracks.length; i++)
            songs.push(TrackUtils.build(Searched.tracks[i], message.author));
          player.queue.add(songs);
          if (!player.playing && !player.paused && player.queue.totalSize === Searched.tracks.length)
            player.play();
         const thing = new MessageEmbed()
             .setColor(client.embedColor)
             	.setAuthor({ name: "Spotify Playlist", iconURL: "https://media.discordapp.net/attachments/964028389688246344/975725010889105418/emoji.png"})
             .setTimestamp()
    .setTitle("Playlist Loaded!")
 .setDescription(`**Added Playlist to queue** [${Searched.playlistInfo.name}](${SearchString}) - [\`${Searched.tracks.length}\`]`)
          return message.channel.send({embeds: [thing]});
     } else if (Searched.loadType.startsWith("TRACK")) {
          player.queue.add(TrackUtils.build(Searched.tracks[0], message.author));
       if (!player.playing && !player.paused && !player.queue.size)
            player.play();
            const thing = new MessageEmbed()
             .setColor(client.embedColor)
                  	.setAuthor({ name: "Song added", iconURL: "https://media.discordapp.net/attachments/964028389688246344/975433622125445220/diona-genshin.gif"})     	

              .setTimestamp()
             .setDescription(` **Song title : **[${Searched.tracks[0].info.title}](${Searched.tracks[0].info.uri})
**Song duration :** ${Searched.tracks[0].info.duration}\`
**Uploaded by :** ${Searched.tracks[0].info.author}
**Requested by :** ${Searched.tracks[0].info.requester}`)
 
.setThumbnail(`https://img.youtube.com/vi/${Searched.tracks[0].identifier}/maxresdefault.jpg`)

       return message.channel.send({embeds: [thing]});
           } else {
         return message.channel.send({ embeds: [new MessageEmbed().setColor(client.embedColor).setTimestamp().setDescription('there were no results found.')]});
        }
      } else {
        let Searched = await player.search(SearchString, message.author);
         if (!player)
           return message.channel.send({ embeds: [new MessageEmbed().setColor(client.embedColor).setTimestamp().setDescription("Nothing is playing right now...")]});

         if (Searched.loadType === "NO_MATCHES")
           return message.channel.send({ embeds: [new MessageEmbed()].setColor(client.embedColor).setTimestamp().setDescription(`No matches found for - [this]${SearchString}`)});
        else if (Searched.loadType == "PLAYLIST_LOADED") {
          player.queue.add(Searched.tracks);
          if (!player.playing && !player.paused &&
            player.queue.totalSize === Searched.tracks.length)
            player.play();
         const thing = new MessageEmbed()
             .setColor(client.embedColor)
             		.setAuthor({ name: "Youtube Playlist", iconURL: "https://media.discordapp.net/attachments/964028389688246344/975726848187203624/emoji-1.png"}) 
             .setTimestamp()
    .setTitle("Playlist Queued")    
           .setDescription(` **Playlist name **: [${Searched.playlist.name}](${SearchString}) 
**Playlist total songs **: \`${Searched.tracks.length}\` 
**Playlist total duration :** \`[${convertTime(Searched.playlist.duration)}]\``)
          
          
           return message.channel.send({embeds: [thing]});
        } else {
          player.queue.add(Searched.tracks[0], message.author);
          if (!player.playing && !player.paused && !player.queue.size)
            player.play();
        const thing = new MessageEmbed()
             .setColor(client.embedColor)
             		.setAuthor({ name: "Diona", iconURL: "https://media.discordapp.net/attachments/733239473214586921/911218908852273172/diona-relax.gif"}) 

             .setTimestamp()
          .setTitle("Song Queued")
             .setDescription(` **Song Title:**[${Searched.tracks[0].title}](${Searched.tracks[0].uri})\n**Song Duration:**\`[${convertTime(Searched.tracks[0].duration)}]\`\n**Song Uploader:** ${Searched.tracks[0].author}`)
          .setThumbnail(`https://img.youtube.com/vi/${Searched.tracks[0].identifier}/maxresdefault.jpg`);
          
           return message.channel.send({embeds: [thing]});
        }
      }
    } catch (e) {
      console.log(e);

      }
   }
};
