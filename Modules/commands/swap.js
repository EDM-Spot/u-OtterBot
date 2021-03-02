const { isObject } = require("lodash");

module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["swap"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 60,
    parameters: "<@username> <@username>",
    description: "Swap users position.",
    async execute(rawData, { args, mentions }, lang) { // eslint-disable-line no-unused-vars
      if (!mentions.length || mentions.length !== 2) {
        this.reply(lang.invalidUser, {}, 6e4);
        return false;
      }

      const user = mentions[0];
      const user2 = mentions[1];

      if (!isObject(user) || !isObject(user2)) {
        this.reply(lang.userNotFound, {}, 6e4);
        return false;
      }

      const userPosition = await bot.getWaitlistPos(user._id);
      const user2Position = await bot.getWaitlistPos(user2._id);

      if (userPosition < 1 || user2Position < 1) {
        this.reply(lang.give.notInList, {}, 6e4);
        return false;
      }
      
      bot.queue.add(user, user2Position);
      await bot.wait(1000);
      bot.queue.add(user2, userPosition);
      return true;
    },
  });
};