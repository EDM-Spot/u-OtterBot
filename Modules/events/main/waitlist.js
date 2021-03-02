const { each, isNil } = require("lodash");

module.exports = function Event(bot, platform) {
  const event = {
    name: "waitlistUpdate",
    platform,
    previous: undefined,
    checkForLeave(id) {
      return new Promise((resolve, reject) => {
        function run(user) {
          console.log("user//////////////////////////////////////////////////////////////");
          console.log(user);
          if (user.id === id) resolve();
        }

        bot.socketEvents.on("leave", run);

        setTimeout(() => {
          bot.socketEvents.removeListener("leave", run); reject();
        }, 3e3);
      });
    },
    run: async (newWaitList) => {
      const previousWaitList = event.previous;

      if (previousWaitList.length > newWaitList.length) {
        each(previousWaitList, (userID, position) => {
          position++;

          if (position !== newWaitList.length && !newWaitList.includes(userID)) {
            event.checkForLeave(userID).then(async () => {
              const latestDisconnection = await bot.redis.findDisconnection(userID);

              if (isNil(latestDisconnection) || position < latestDisconnection) {
                await bot.redis.registerDisconnection(userID, position);
              }
            }).catch(() => {});
          }
        });
      }

      // always at the end to keep a consistent 'previous' waitlist
      event.previous = await bot.getWaitlist();
    },
    async init() {
      this.previous = await bot.getWaitlist();

      bot.socketEvents.on(this.name, this.run);
    },
    kill() {
      bot.socketEvents.removeListener(this.name, this.run);
    },
  };

  bot.events.register(event);
};