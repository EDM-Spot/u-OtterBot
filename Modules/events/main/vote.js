const { isNil } = require("lodash");

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: "vote",
    platform,
    _filename: filename,
    run: async () => {
      const dj = await bot.getDj();
      const votes = await bot.getVotes();

      if (isNil(votes)) return;

      const mehCount   = votes.downvotes.length;
      const usersCount = await bot.getUsers().length;
      const mehPercent = Math.round((mehCount / usersCount) * 100);

      if (mehPercent >= 7 && mehCount >= 3) {
        bot.global.isSkippedByMehGuard = true;
        
        bot.chat(`@${dj.user.username} ` + bot.lang.mehSkip);
        await bot.skip();
      }
    },
    init() {
      bot.socketEvents.on(this.name, this.run);
    },
    kill() {
      bot.socketEvents.removeListener(this.name, this.run);
    },
  };

  bot.events.register(event);
};