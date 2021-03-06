const Discord = require("discord.js");

module.exports = function Util(bot) {
  const util = {
    name: "timeCover",
    function: async () => {
      const users = await bot.getUsers();
      const usersCount = users.length;

      //const modsOnline = users.filter(u => u.role >= ROLE.DJ).join(", ");

      const embed = new Discord.MessageEmbed()
        .setAuthor("Time Cover Utility", "http://icons.iconarchive.com/icons/hamzasaleem/stock-apps-style-2-part-2/64/Time-Machine-icon.png")
        .setColor(0xFF00FF)
        .setFooter("By TheOtterBot")
        .setTimestamp()
        .addField("Users Online", usersCount, true)
        .addField("Mods Online", 0, true);

      bot.channels.cache.get("536278824753561630").send({embed});
    },
  };

  bot.utils.register(util);
};