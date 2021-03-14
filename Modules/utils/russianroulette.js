const { isObject, isNil } = require("lodash");

module.exports = function Util(bot) {
  class RussianRouletteUtil {
    constructor() {
      this.running = false;
      this.price = undefined;
      this.duration = undefined;
      this.players = [];
    }
    async start(duration, price) {
      this.running = true;
      this.duration = duration;
      this.price = price;

      await bot.redis.placeCommandOnCooldown("main", "russianroulette@start", "perUse", 1, 10800);

      this.timeout = setTimeout(async () => {
        await this.sort();
      }, duration * 1e3);
    }
    end() {
      this.running = false;
      this.price = undefined;
      this.duration = undefined;
      this.players = [];

      clearTimeout(this.timeout);

      return true;
    }
    async check(cooldown) {
      if (cooldown) {
        return bot.redis.getCommandOnCoolDown("main", "russianroulette@start", "perUse");
      }

      return this.running;
    }
    add(id) {
      if (!this.players.includes(id)) {
        this.players.push(id);
        return true;
      }

      return false;
    }
    async chooseVictim(players) {
      this.running = false;

      const victim = players[Math.floor(Math.random() * players.length)];
      const user = await bot.getUser(victim);
      const waitlist = await bot.getWaitlist();

      if (!players.length) {
        bot.chat(bot.lang.russianroulette.countOver);
        this.end();
        return;
      }

      if (isNil(user)) {
        bot.chat(bot.utils.replace(bot.lang.russianroulette.chicken, {
          user: victim,
        }));

        await bot.redis.removeDisconnection(victim);
        this.chooseVictim(players.filter(player => player !== victim));
        return;
      }

      await bot.wait(3000);
      bot.chat(bot.utils.replace(bot.lang.russianroulette.shot, {
        user: user.username,
      }));
      await bot.wait(5000);

      const randomBool = Math.random() >= 0.5;

      const pos = await bot.getWaitlistPos(victim);
      const luckyshot = Math.floor(Math.random() * (pos - 5)) + 5;
      const unluckyshot = Math.floor(Math.random() * (waitlist.length - pos) + pos + 1);

      if (randomBool) {
        bot.chat(bot.utils.replace(bot.lang.russianroulette.luckyshot, {
          user: user.username,
        }));

        if (isNil(pos)) {
          bot.queue.add(user, waitlist.length);

          this.chooseVictim(players.filter(player => player !== victim));
          return;
        }

        bot.queue.add(user, luckyshot);
      } else {
        bot.chat(bot.utils.replace(bot.lang.russianroulette.unluckyshot, {
          user: user.username,
        }));

        if (isNil(pos)) {
          this.chooseVictim(players.filter(player => player !== victim));
          return;
        }

        bot.queue.add(user, unluckyshot);
      }

      this.chooseVictim(players.filter(player => player !== victim));
    }
    async sort() {
      if (this.players.length < 3) {
        this.end();
        return bot.chat(bot.lang.roulette.noplayers);
      }

      this.running = false;

      const alteredOdds = this.players;

      return this.chooseVictim(alteredOdds);
    }
  }

  bot.russianRoulette = new RussianRouletteUtil();
};