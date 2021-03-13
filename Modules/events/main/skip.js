const { isNil } = require("lodash");
const Discord = require("discord.js");

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: "skip",
    platform,
    _filename: filename,
    run: async (moderatorID, userID, reason) => {
      if (isNil(moderatorID) || isNil(userID)) return;

      const moderator = await bot.getUser(moderatorID);
      
      if (isNil(moderator)) return;

      const botID = await bot.getSelf();
      if (moderator.id === botID._id) return;

      await bot.getRoomHistory().then(async (history) => {
        var skippedSong = history;

        if (isNil(skippedSong)) return;

        const embed = new Discord.MessageEmbed()
          //.setTitle("Title")
          .setAuthor(skippedSong.user.username, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
          .setColor(0xFF00FF)
          //.setDescription("This is the main body of text, it can hold 2048 characters.")
          .setFooter("By " + moderator.username)
          //.setImage("http://i.imgur.com/yVpymuV.png")
          //.setThumbnail("http://i.imgur.com/p2qNFag.png")
          .setTimestamp()
          .addField("Reason ", reason, true)
          .addField("ID", skippedSong.user.id, true)
          .addField("Skipped", skippedSong.media.name + " (youtube.com/watch?v=" + skippedSong.media.sourceID + ")", false);
        //.addBlankField(true);

        bot.channels.cache.get("487985043776733185").send({ embed });
      });
    },
    init() {
      bot.socketEvents.on(this.name, this.run);
    },
    kill() {
      bot.socketEvents.removeListener(this.name, this.run);
    },
  };

  bot.events.register(event);
};