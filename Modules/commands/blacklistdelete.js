const { isObject, isNil, has, get } = require("lodash");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["bdel", "bldel"],
    minimumPermission: 2000,
    cooldownType: "perUser",
    cooldownDuration: 3,
    parameters: "<YouTube Link|SoundCloud Link>",
    description: "Delete a song from blacklist",
    async execute(rawData, { args }, lang) {
      return bot.chat("Not Implemented");
      
      const link = args.shift();
      const cid = bot.youtube.getMediaID(link);

      if (!isNil(cid)) {
        const song = await bot.db.models.blacklist.findOne({
          where: {
            cid: cid,
          },
        });

        if (isNil(song)) return false;

        const YouTubeMediaData = await bot.youtube.getMedia(cid);
        const fullTitle = get(YouTubeMediaData, "snippet.title");

        await bot.db.models.blacklist.destroy({ where: { cid: cid } });
        this.reply(lang.blacklist.deleted, {}, 6e4);

        const embed = new Discord.MessageEmbed()
          //.setTitle("Title")
          .setAuthor(fullTitle, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
          .setColor(0xFF00FF)
          //.setDescription("This is the main body of text, it can hold 2048 characters.")
          .setFooter("By " + rawData.un)
          //.setImage("http://i.imgur.com/yVpymuV.png")
          //.setThumbnail("http://i.imgur.com/p2qNFag.png")
          .setTimestamp()
          //.addField("This is a field title, it can hold 256 characters")
          .addField("Removed From Blacklist", " (youtube.com/watch?v=" + cid + ")", false);
        //.addBlankField(true);

        bot.channels.cache.get("486637288923725824").send({ embed });

        return true;
      } else if (link.includes("soundcloud.com")) {
        const soundcloudMediaRaw = await bot.soundcloud.resolve(link);
        const soundcloudMedia = JSON.parse(soundcloudMediaRaw);

        if (isNil(soundcloudMedia)) return false;

        if (isObject(soundcloudMedia) && has(soundcloudMedia, "id")) {
          const song = await bot.db.models.blacklist.findOne({
            where: {
              cid: `${soundcloudMedia.id}`,
            },
          });

          if (isNil(song)) return false;

          const SoundCloudMediaData = await bot.soundcloud.getTrack(soundcloudMedia.id);
          const fullTitle = SoundCloudMediaData.title;

          await bot.db.models.blacklist.destroy({ where: { cid: `${soundcloudMedia.id}` } });
          this.reply(lang.blacklist.deleted, {}, 6e4);

          const embed = new Discord.MessageEmbed()
            //.setTitle("Title")
            .setAuthor(fullTitle, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
            .setColor(0xFF00FF)
            //.setDescription("This is the main body of text, it can hold 2048 characters.")
            .setFooter("By " + rawData.un)
            //.setImage("http://i.imgur.com/yVpymuV.png")
            //.setThumbnail("http://i.imgur.com/p2qNFag.png")
            .setTimestamp()
            //.addField("This is a field title, it can hold 256 characters")
            .addField("Removed From Blacklist", "SoundCloud", false);
          //.addBlankField(true);

          bot.channels.cache.get("486637288923725824").send({ embed });

          return true;
        }

        return false;
      }

      this.reply(lang.blacklist.invalidLink, {}, 6e4);
      return false;
    },
  });
};