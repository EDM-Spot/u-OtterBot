const { isObject } = require("lodash");

module.exports = function Util(bot) {
  const util = {
    name: "lockskip",
    function: user => new Promise((resolve, reject) => {
      return;

      const shouldCycle = bot.isCycling();
      const waitList = bot.waitlist();
      const historyEntry = bot.getDj();

      const lockSkip = {
        position: 2,
        withCycle: async () => {
          await bot.enableCycle();
          await bot.skip();
          await user.move(lockSkip.position);
          await bot.disableCycle();
          return resolve();
        },
        withoutCycle: async () => {
          await bot.skip();
          await user.move(lockSkip.position);
          return resolve();
        },
        addingDJ: async () => {
          await bot.skip();
          await user.add();
          await user.move(lockSkip.position);
          return resolve();
        },
        onlySkip: async () => {
          await bot.skip();
          return resolve();
        },
        skipOnlyAdd: async () => {
          await bot.skip();
          await user.add();
          return resolve();
        },
        run: function RunLockSkip() {
          try {
            if (!isObject(historyEntry)) {
              return Promise.reject(new Error("[!] No DJ or Media playing."));
            } else if (!waitList.length && shouldCycle) {
              return this.onlySkip();
            } else if (!shouldCycle && waitList.length < this.position) {
              return this.skipOnlyAdd();
            } else if (!shouldCycle && (waitList.length >= 4 && waitList.length <= 45)) {
              return this.addingDJ();
            } else if (shouldCycle && (waitList.length >= 4 && waitList.length <= 45)) {
              return this.withoutCycle();
            } else if (!shouldCycle) {
              return this.withCycle();
            }

            return this.withoutCycle();
          } catch (err) {
            console.error("[!] LockSkip Error");
            console.error(err);
            return reject(err);
          }
        },
      };

      return lockSkip.run();
    }),
  };

  bot.utils.register(util);
};