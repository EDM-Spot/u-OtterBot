const { each, isObject, isNil } = require("lodash");
const moment = require("moment");
require("moment-timer");
const momentRandom = require("moment-random");

module.exports = function Util(bot) {
  class LotteryUtil {
    constructor() {
      this.players = [];
      this.timer = undefined;
      this.canJoinDate = undefined;
      this.giveTimer = undefined;
      this.acceptedBool = false;
    }
    async start() {
      const startRandom = moment().add(1, "hours");
      const endRandom = moment().add(3, "hours");
      const eventStart = momentRandom(endRandom, startRandom);
      this.canJoinDate = moment(eventStart).subtract(1, "hours");

      const randomTimeDuration = eventStart - moment();

      this.timer = new moment.duration(randomTimeDuration, "milliseconds").timer({loop: false, start: true}, async () => {
        this.acceptedBool = false;
        await this.sort();
      });
    }
    add(id) {
      if (!this.players.includes(id)) {
        this.players.push(id);
        return true;
      }

      return false;
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
    accepted() {
      this.players = [];
      this.timer = undefined;
      this.canJoinDate = undefined;
      this.acceptedBool = true;

      this.giveTimer.stop();

      return this.start();
    }
    async winner(players) {
      if (this.acceptedBool) return;

      const waitlist = await bot.getWaitlist();
      if (waitlist.length <= 10) return;

      const winner = players[Math.floor(Math.random() * players.length)];
      const user = await bot.getUser(winner);

      if (isNil(user)) {
        this.winner(players.filter(player => player !== winner));
        return;
      }

      if (!players.length) {
        this.players = [];
        this.timer = undefined;
        this.canJoinDate = undefined;

        return this.start();
      }

      const position = 5;

      const userPos = await bot.getWaitlistPos(user._id);

      if (userPos >= 1 && userPos <= 5) {
        this.winner(players.filter(player => player !== winner));
        return;
      }

      const botID = await bot.getSelf();
      await bot.redis.removeGivePosition(botID._id, user._id);

      bot.chat(bot.utils.replace(bot.lang.lotteryWinner, {
        winner: user.username,
        position: position,
      }));

      //bot.queue.add(user, position);
      await bot.redis.registerGivePosition(botID._id, user._id, position);

      this.giveTimer = moment.duration(3, "minutes").timer({loop: false, start: true}, async () => {
        bot.chat(bot.lang.notAccepted);
        bot.redis.removeGivePosition(botID._id, user._id);
        this.winner(players.filter(player => player !== winner));
      }, (120000));
    
      //this.players = [];
      //this.timer = undefined;
      //this.canJoinDate = undefined;

      //this.start();
    }
    async sort() {
      if (!this.players.length) {
        this.players = [];
        this.timer = undefined;
        this.canJoinDate = undefined;
        
        return this.start();
      }

      const alteredOdds = [];

      each(this.players, async (player) => {
        const user = await bot.getUser(player);
        const pos = await bot.getWaitlistPos(player);
        
        if (!isNil(user)) {
          if (isNil(pos)) {
            alteredOdds.push(...Array(this.multiplier(this.players.length, false)).fill(player));
          } else {
            if (pos > 5) {
              alteredOdds.push(...Array(this.multiplier(this.players.length, true)).fill(player));
            }
          }
        }
      });

      return this.winner(alteredOdds);
    }
  }

  bot.lottery = new LotteryUtil();
};