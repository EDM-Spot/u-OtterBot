const { isObject } = require("lodash");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["skip", "s"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 3,
    parameters: "",
    description: "Force skips the current DJ.",
    async execute(rawData, { name }, lang) {
      const currentMedia = bot.getDj();

      if (isObject(currentMedia)) {
        await bot.skip(rawData.uid, "Skipped using !skip");

        this.reply(lang.moderation.effective, {
          mod: rawData.un,
          command: `!${name}`,
          user: currentMedia.user.username,
        });

        const embed = new Discord.MessageEmbed()
          //.setTitle("Title")
          .setAuthor(currentMedia.media.author + " - " + currentMedia.media.title, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
          .setColor(0xFF00FF)
          //.setDescription("This is the main body of text, it can hold 2048 characters.")
          .setFooter("By " + rawData.un)
          //.setImage("http://i.imgur.com/yVpymuV.png")
          //.setThumbnail("http://i.imgur.com/p2qNFag.png")
          .setTimestamp()
          //.addField("This is a field title, it can hold 256 characters")
          .addField("ID", currentMedia.user._id, true)
          .addField("User ", currentMedia.user.username, true)
          .addField("Skipped", " (youtube.com/watch?v=" + currentMedia.media.sourceID + ")", false);
        //.addBlankField(true);

        bot.channels.cache.get("486637288923725824").send({ embed });

        return true;
      }

      return false;
    },
  });
};