module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["updaterdj"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 2,
    parameters: "",
    description: "Update RDJ.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      return bot.chat("Not Implemented");
      
      const users = await bot.plug.getStaff();

      const listDJ = users.filter(u => u.role === ROLE.DJ);
      
      var i = 0;
      for (i = 0; i < listDJ.length; i++) {
        //var interval = setInterval(async function() {
          if (listDJ[i].gRole < ROLE.SITEMOD) {
            console.log(listDJ[i].username);
            await bot.utils.updateRDJ(listDJ[i].id);
          }

          //if (i === listDJ.length) clearInterval(interval);
        //}, 10000);
      }

      return true;
    },
  });
};