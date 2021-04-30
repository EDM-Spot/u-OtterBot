module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["pldelete"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 2,
    parameters: "",
    description: "Delete Bot Playlist.",
    async execute() {
      const currentList = await bot.getPlaylistItems();
      const itemIDs = currentList.map((media) => media._id);

      await bot.deletePlaylistItems(itemIDs);

      return true;
    },
  });
};