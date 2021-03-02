module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["reload"],
    minimumPermission: 3000,
    cooldownType: "perUse",
    cooldownDuration: 10,
    parameters: "",
    description: "Reloads the bot.",
    async execute() {
      setTimeout(() => process.exit(1), 1e3);
      return true;
    },
  });
};