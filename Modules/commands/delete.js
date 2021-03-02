module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["d"],
    minimumPermission: 1000,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "",
    description: "Deletes your own message. Why not?",
    async execute() {
      return true;
    },
  });
};