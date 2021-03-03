const { each, isNil, get } = require("lodash");

module.exports = function Util(bot) {
  class Queue {
    constructor() {
      this.users = [];
      this.shouldUnlock = true;

      bot.socketEvents.on("waitlistUpdate", this.run);
    }
    add(user, position) {
      //console.log(user);
      position = position - 1;

      if (this.users.map(u => u.user._id).includes(user._id)) {
        return this.update(user, position);
      }

      this.users.push({ user, position });

      return this.run();
    }
    update(user, position) {
      //console.log(user);
      each(this.users, (queueUser) => {
        if (queueUser.user._id === user._id) {
          queueUser.position = position;
        }
      });

      return this.run();
    }
    remove(user) {
      //console.log(user);
      each(this.users, (queueUser, index) => {
        if (queueUser.user._id === user._id) {
          this.users.splice(index, 1);
        }
      });

      return this.run();
    }
    async run() {
      const waitlist = await bot.getWaitlist();
      const dj = await bot.getDj();

      if (isNil(this.users)) {
        this.users = [];
      }

      if (!this.users.length) {
        if (this.shouldUnlock) {
          if (await bot.isLocked()) {
            await bot.setLock(); //false
          }
          this.shouldUnlock = false;
        }

        return;
      }

      const next = this.users.shift();

      if (waitlist.length === 50 && !waitlist.contains(next.user._id)) {
        if (!await bot.isLocked()) {
          try {
            await bot.setLock(); // true
            this.shouldUnlock = true;
          } catch (err) {
            console.warn("setLock Error!");
            console.error(err);
          }

          this.users.push(next);
          return;
        }
      }

      if (!isNil(dj) && dj._id === next.user._id) {
        this.users.push(next);
        return;
      } else if (await bot.getWaitlistPos(next.user._id) === -1) {
        try {
          await bot.joinWaitlist(next.user._id);
        } catch (err) {
          if (get(err, "response.body.status")) {
            switch (get(err, "response.body.status")) {
              case "noValidPlaylist":
                bot.chat(`@${next.user.username} ` + bot.lang.en.queue.noValidPlaylist); //.delay(6e4).call("delete");
                return;
              case "roomMismatch":
                bot.chat(bot.utils.replace(bot.lang.queue.roomMismatch, { user: next.user._id })); //.delay(6e4).call("delete");
                return;
              // to-do: handle wait list banned users
              default:
                console.warn("next.user.add Error!");
                console.error(err);
                return;
            }
          }
        }

        if (next.position < waitlist.length) {
          try {
            await next.user.move(next.position);
          } catch (err) {
            console.warn("next.move Error!");
            console.error(err);
            this.users.push(next);
            return;
          }
        }
      } else {
        try {
          await next.user.move(next.position);
        } catch (err) {
          this.users.push(next);
          return;
        }

        if (this.shouldUnlock) {
          if (await bot.isLocked()) {
            await bot.setLock(); //false
          }
          this.shouldUnlock = false;
        }
      }

      if (this.shouldUnlock) {
        if (await bot.isLocked()) {
          await bot.setLock(); //false
        }
        this.shouldUnlock = false;
      }
    }
  }

  bot.queue = new Queue();
};