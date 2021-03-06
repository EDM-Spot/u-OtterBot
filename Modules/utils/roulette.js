const { each, isNil } = require("lodash");
const moment = require("moment");

module.exports = function Util(bot) {
  class RouletteUtil {
    constructor() {
      this.running = false;
      this.price = undefined;
      this.duration = undefined;
      this.players = [];
    }
    async autoStart() {
      const waitlist = await bot.getWaitlist();
      const day = moment().isoWeekday();
      const isWeekend = (day === 6) || (day === 7);
      const isDecember = (moment().month() === 11);

      if (await this.check() || await bot.russianRoulette.check() || bot.triviaUtil.check() || bot.pokerUtil.checkGame()) {
        return;
      }

      const cooldown = await bot.redis.getCommandOnCoolDown("main", "roulette@start", "perUse");

      if (cooldown != -2) {
        return;
      }

      if (waitlist.length < 10) {
        return;
      }

      const duration = 60;
      let price = 0;

      if (isWeekend || isDecember) {
        price = 0;
      }

      await this.start(duration, price);

      if (isWeekend  && !isDecember) {
        bot.chat(bot.utils.replace(bot.lang.commands.roulette.startingWeekend, {})); //.delay(duration * 1e3).call("delete");
      }

      if (isDecember) {
        bot.chat(bot.utils.replace(":christmasballs1: Merry Christmas! :christmasballs1:", {})); //.delay(duration * 1e3).call("delete");
      }

      bot.chat(bot.utils.replace(bot.lang.commands.roulette.starting, {})); //.delay(duration * 1e3).call("delete");

      bot.chat(bot.utils.replace(bot.lang.commands.roulette.info, {
        duration,
        price: price === 0 ? bot.lang.commands.roulette.free : `${price} prop${price > 1 ? "s" : ""}`,
      })); //.delay(duration * 1e3).call("delete");
    }
    async start(duration, price) {
      this.running = true;
      this.duration = duration;
      this.price = price;

      await bot.redis.placeCommandOnCooldown("main", "roulette@start", "perUse", 1, 3600);

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
        return bot.redis.getCommandOnCoolDown("main", "roulette@start", "perUse");
      }

      return this.running;
    }
    add(id) {
      if (!this.players.includes(id)) {
        console.log(id);
        this.players.push(id);
        return true;
      }

      return false;
    }
    static position(currentPosition, waitlistLength) {
      // the highest position you can go to is 5
      // users outside the list have a chance to get at least pos 35
      return !isNil(currentPosition) ?
        Math.floor(Math.random() * (currentPosition - 5)) + 5 :
        Math.floor(Math.random() * Math.min(waitlistLength, 35)) + 5;
    }
    async multiplier(players, isIn) {
      // multipler for users outside the waitlist
      const outside = [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      ];
      // multipler for users inside the waitlist
      const inside = [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        3, 3, 3, 3, 3,
      ];

      return isIn ? (inside[players] || 2) : (outside[players] || 3);
    }
    async winner(players) {
      console.log("//WINNERS");
      console.log(players);

      const winner = players[Math.floor(Math.random() * players.length)];
      const user = await bot.getUser(winner);
      const waitlist = await bot.getWaitlist();

      if (!players.length && this.end()) {
        bot.chat(bot.lang.roulette.somethingwrong);
        return;
      }

      const userPos = await bot.getWaitlistPos(winner);
      const position = this.constructor.position(userPos, waitlist.length);

      if (isNil(user)) {
        this.winner(players.filter(player => player !== winner));
        return;
      }

      // const day = moment().isoWeekday();
      // const isWeekend = (day === 5) || (day === 6) || (day === 7);

      // if (isWeekend) {
      //   const random = Math.floor(Math.random() * (50 - 10 + 1)) + 10;

      //   const [holidayUser] = await bot.db.models.holiday.findOrCreate({
      //     where: { id: user.id }, defaults: { id: user.id },
      //   });

      //   await holidayUser.increment("currency", { by: random });

      //   await bot.plug.sendChat(user.username + " won " + random + " :fplcandy:");
      // }

      bot.chat(bot.utils.replace(bot.lang.roulette.winner, {
        winner: user.username,
        position: position,
      }));
      this.end();
      bot.queue.add(user, position);
    }
    async sort() {
      if (!this.players.length && this.end()) {
        this.end();
        return bot.chat(bot.lang.roulette.noplayers);
      }

      if (this.players.length < 3) {
        this.end();
        return bot.chat(bot.lang.roulette.noplayers);
      }

      this.running = false;

      const alteredOdds = [];

      each(this.players, async (player) => {
        const user = await bot.getUser(player);
        const pos = await bot.getWaitlistPos(player);

        if (!isNil(user)) {
          if (isNil(pos)) {
            alteredOdds.push(...Array(this.multiplier(this.players.length, false)).fill(player));
          } else {
            alteredOdds.push(...Array(this.multiplier(this.players.length, true)).fill(player));
          }
        }
      });

      console.log(alteredOdds);
      return this.winner(alteredOdds);
    }
  }

  bot.roulette = new RouletteUtil();
};