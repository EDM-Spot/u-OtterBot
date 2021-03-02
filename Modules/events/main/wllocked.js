const { isObject } = require("lodash");
const Discord = require("discord.js");

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: "waitlistLock",
    platform,
    _filename: filename,
    run: async (moderatorID, locked) => {
      return;
      
      if (!isObject(update)) return;

      if (update.user.id === bot.plug.me().id) return;

      const embed = new Discord.MessageEmbed()
        //.setTitle("Title")
        .setAuthor(update.user.username, "http://www.myiconfinder.com/uploads/iconsets/64-64-60eade7f184e696a79fa2ff1e81c851d.png")
        .setColor(0xFF00FF)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("By " + update.user.username)
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("http://i.imgur.com/p2qNFag.png")
        .setTimestamp()
        //.addField("This is a field title, it can hold 256 characters")
        .addField("Update", "Waitlist", true)
        .addField("Data", update.locked ? "Locked" : "Unlocked", true);
      //.addBlankField(true);

      bot.channels.cache.get("486637288923725824").send({embed});
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