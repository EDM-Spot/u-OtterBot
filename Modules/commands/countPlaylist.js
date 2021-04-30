module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["plcount"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 2,
    parameters: "",
    description: "Count Bot Playlist.",
    async execute() {
      const currentList = await bot.getPlaylistItems();
      const itemIDs = currentList.map((media) => media._id);

      bot.chat(`There's ${itemIDs.length} songs in the playlist.`);
      
      return true;
    },
  });
};