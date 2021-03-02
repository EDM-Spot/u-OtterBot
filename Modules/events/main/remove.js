const { isObject } = require("lodash");

module.exports = function Event(bot, platform) {
  const event = {
    name: "waitlistLeave",
    platform,
    run: async (userID, waitlist) => {
      //if (data.inBooth) return;

      //const userDB = await bot.db.models.users.findOne({ where: { username: data.username }});
      //const userID = userDB.get("id");

      //if (!isObject(data)) return;

      await bot.redis.removeDisconnection(userID);
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