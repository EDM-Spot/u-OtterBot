const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["rules", "rule"],
    minimumPermission: 0,
    cooldownType: "perUse",
    cooldownDuration: 60,
    parameters: "[@username]",
    description: "Links the community rules.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      const username = args.join(" ").substr(1);
      const users = await bot.getUsers();
      const user = users.filter(u => u.username.toLowerCase() === username.toLowerCase())[0] ||
				users.filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];

      this.reply(lang.rules, { mention: user || "" });
      return true;
    },
  });
};