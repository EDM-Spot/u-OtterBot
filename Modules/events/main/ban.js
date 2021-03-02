const { isObject, isNil } = require("lodash");
const Discord = require("discord.js");

module.exports = function Event(bot, platform) {
  const event = {
    name: "ban",
    platform,
    run: async (data) => {
      if (isNil(data)) return;
      
      //const userDB = await bot.db.models.users.findOne({ where: { username: data.username }});

      //if (isNil(userDB)) { console.log(data); return; }

      //const userID = userDB.get("id");
      
      //await bot.db.models.bans.create({
        //id: userID,
        //type: "BAN",
        //duration: data.duration,
      //});

      if (data.moderatorID === await bot.getSelf()._id) return;

      const user = await bot.getUser(data.userID);
      const moderator = await bot.getUser(data.moderatorID);

      const embed = new Discord.MessageEmbed()
        //.setTitle("Title")
        .setAuthor(user.username, "http://icons.iconarchive.com/icons/paomedia/small-n-flat/64/sign-ban-icon.png")
        .setColor(0xFF00FF)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("By " + moderator.username)
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("http://i.imgur.com/p2qNFag.png")
        .setTimestamp()
        //.addField("This is a field title, it can hold 256 characters")
        .addField("ID", data.userID, true)
        .addField("Type", "Ban", true)
        .addField("Time", data.duration, true);
      //.addBlankField(true);

      bot.channels.cache.get("487985043776733185").send({embed});

      await bot.redis.removeDisconnection(data.userID);

      bot.chat(":banhammer:");
      //await bot.utils.updateRDJ(data.userID);
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