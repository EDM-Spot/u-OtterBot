module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["plupdate"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 2,
    parameters: "",
    description: "Update Bot Playlist.",
    async execute() {
      await bot.autoplay.updatePlaylist();
      return true;
    },
  });
};