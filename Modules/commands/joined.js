const { isNil } = require("lodash");
const moment = require("moment");

module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["joined"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 21600,
    parameters: "",
    description: "Check when user joined the community.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      return bot.chat("Not Implemented");
      
      const { uid: id } = rawData;

      const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });

      const joined = inst.get("createdAt");

      if (isNil(joined)) {
        return false;
      }

      this.reply(lang.joined, { joined: moment(joined).fromNow() });
      return true;
    },
  });
};