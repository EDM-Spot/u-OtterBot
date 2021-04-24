const Command = require("../base/Command.js");
const { isNil } = require("lodash");
const moment = require("moment");

class Join extends Command {
  constructor(client) {
    super(client, {
      name: "join",
      description: "Join Trivia.",
      usage: "join"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      //message.delete();

      const day = moment().isoWeekday();
      const isWeekend = (day === 6) || (day === 7);
      const isDecember = (moment().month() === 11);

      let price = 0;

      if (isWeekend || isDecember) {
        price = 0;
      }

      const user = await this.client.getUserbyDiscord(message.author.id);

      if (isNil(user)) {
        return message.reply("You need to link your account first! Read how in the faq here: https://edmspot.net");
      }

      const dj = await this.client.getDj();

      const userPos = await this.client.getWaitlistPos(user._id);

      if (!this.client.triviaUtil.check()) {
        return message.reply("Trivia is not running!");
      } else if (this.client.triviaUtil.started) {
        return message.reply("Trivia already started!");
      } else if (isNil(dj) && dj.user._id === user._id) {
        return message.reply("You can't join while playing!");
      } else if (userPos >= 1 && userPos <= 4) {
        return message.reply("You are too close to DJ.");
      }

      if (this.client.triviaUtil.players.includes(user._id)) return true;

      //const [inst] = await this.client.db.models.users.findOne({ id: user.id });

      //const props = inst.get("props");

      //if (props < price) {
        //return message.reply("You don't have enough props.");
      //}

      //await inst.decrement("props", { by: price });
      //await this.client.db.models.users.increment("props", { by: price, where: { id: "40333310" } });

      this.client.triviaUtil.add(user._id);
      await this.client.guilds.cache.get("485173051432894489").members.cache.get(message.author.id).roles.add("512635547320188928").catch(console.error);

      return message.reply("Joined Trivia.");
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Join;
