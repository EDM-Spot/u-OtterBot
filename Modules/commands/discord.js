module.exports = function Command(bot) {
  bot.uCommands.register({
    names: ["discord"],
    minimumPermission: 0,
    cooldownType: "perUse",
    cooldownDuration: 300,
    parameters: "",
    description: "Links the room Discord.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      this.reply(lang.discord, { });
      return true;
    },
  });
};