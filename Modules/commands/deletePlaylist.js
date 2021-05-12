module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["pldelete"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 2,
    parameters: "",
    description: "Delete Bot Playlist.",
    async execute() {
      let plitems = await bot.getPlaylistItems();
      while (plitems.length > 0) {
        plitems = await bot.getPlaylistItems();
        const itemIDs = plitems.map((media) => media._id);

        await bot.deletePlaylistItems(itemIDs);
      }

      return true;
    },
  });
};