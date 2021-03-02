const { isNil } = require("lodash");
const moment = require("moment");

module.exports = function Event(bot, platform) {
  const event = {
    name: "leave",
    platform,
    run: async (userID) => {
      const user = await bot.getUser(userID);

      if (isNil(user.username) || user.id === await bot.getSelf().id) return;

      //try {
        //await bot.db.models.users.update(
          //{ username: user.username, last_seen: moment() },
          //{ where: { id: user.id }, defaults: { id: user.id }}
        //);
      //}
      //catch (err) {
        //console.warn(err);
        //console.log(user);
      //}

      bot.queue.remove(user);
      await bot.redis.removeGivePosition(userID);
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