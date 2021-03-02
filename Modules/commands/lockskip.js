const { isObject } = require("lodash");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["lockskip", "ls"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 4,
    parameters: "",
    description: "Executes a lockskip, which skips the current DJ and moves them back to the 3rd position to have another try.",
    async execute(rawData, { name }, lang) {
      return bot.chat("Not Implemented");
      
      const currentMedia = await bot.plug.dj();

      if (isObject(currentMedia)) {
        await bot.utils.lockskip(currentMedia.user);
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
          .addField("Lock Skipped", " (youtube.com/watch?v=" + currentMedia.media.sourceID + ")", false);
        //.addBlankField(true);

        bot.channels.cache.get("486637288923725824").send({ embed });

        return true;
      }

      return false;
    },
  });
};