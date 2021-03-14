const Command = require("../base/Command.js");
const { isObject, isNil } = require("lodash");
const moment = require("moment");
require("moment-timer");

class TriviaPay extends Command {
  constructor(client) {
    super(client, {
      name: "triviapay",
      description: "Pay to start Trivia.",
      usage: "triviapay 1-3"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      //message.delete();
      
      if (!args.length) { return; }

      if (await this.client.roulette.check() || await this.client.russianRoulette.check() || this.client.triviaUtil.check() || this.client.pokerUtil.checkGame() || this.client.unoUtil.checkGame() || this.client.russianRouletteUtil.checkGame()) {
        return message.reply("There's a Game running already!");
      }

      const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "trivia@start", "perUse");

      if (cooldown != -2) {
        return message.reply("Hold on! The last Trivia was " + Math.floor((3600 - cooldown) / 60) + " minute(s) ago, you must wait " + Math.ceil(cooldown / 60) + " minute(s) to start another Trivia.");
      }

      const price = 0;

      //if (isNaN(price) || price < 1 || price > 3) {
        //return false;
      //}

      const user = await this.client.getUserbyDiscord(message.author.id);

      if (!isObject(user)) {
        return message.reply("You need to link your account first! Read how here: https://edmspot.ml/faq");
      }

      const dj = await this.client.getDj();

      if (isNil(user)) {
        return message.reply("You're not online!");
      }

      const userPos = await this.client.getWaitlistPos(user._id);

      if (this.client.triviaUtil.started) {
        return message.reply("Trivia already started!");
      } else if (isObject(dj) && dj.user._id === user._id) {
        return message.reply("You can't join while playing!");
      } else if (userPos >= 1 && userPos <= 4) {
        return message.reply("You are too close to DJ.");
      }

      //if (props < price) {
        //return message.reply("You don't have enough props.");
      //}

      //await inst.decrement("props", { by: price });
      //await this.client.db.models.users.increment("props", { by: price, where: { id: "40333310" } });

      if (this.client.triviaUtil.propsStored == 0) {
        message.channel.send("Someone paid to start a Trivia in 5 Minutes! Use `-triviapay 1-3` to use your props to start the Trivia Now.");
        this.client.chat("@djs Someone paid to start a Trivia in 5 Minutes! Use `-triviapay 1-3` in discord to use your props to start the Trivia Now.");
        this.client.chat("Join EDM Spot's Official Discord: https://discord.gg/QvvD8AC");

        this.client.triviaUtil.startingTimer = new moment.duration(5, "minutes").timer({loop: false, start: true}, async () => {
          const cmd = this.client.commands.get("trivia") || this.client.commands.get(this.client.aliases.get("trivia"));
          if (!cmd) return;

          cmd.run(message, "", "Bot Admin");
        });
      }

      this.client.triviaUtil.propsStored += price;

      if (this.client.triviaUtil.propsStored >= 10) {
        this.client.triviaUtil.startingTimer.stop();

        const cmd = this.client.commands.get("trivia") || this.client.commands.get(this.client.aliases.get("trivia"));
        if (!cmd) return;

        cmd.run(message, "", "Bot Admin");
      }

      if (this.client.triviaUtil.propsStored < 10) {
        message.channel.send(this.client.triviaUtil.propsStored + "/10 to start the Trivia Now!");
        this.client.chat(this.client.triviaUtil.propsStored + "/10 to start the Trivia Now!");
      }

      if (this.client.triviaUtil.players.includes(message.author.id)) return message.reply("Paid more " + price + " Props.");

      this.client.triviaUtil.add(message.author.id);
      await this.client.guilds.cache.get("485173051432894489").members.cache.get(message.author.id).roles.add("512635547320188928").catch(console.error);

      return message.reply("Paid " + price + " Props And Joined Next Trivia.");
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = TriviaPay;
