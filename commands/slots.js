// Original Version https://github.com/1Computer1/kaado/blob/master/src/commands/games/slots.js
const Command = require("../base/Command.js");
const Discord = require("discord.js");
const { isNaN, isObject, isNil } = require("lodash");
const { SlotMachine, SlotSymbol } = require("slot-machine");

const symbols = [
  new SlotSymbol("watermelon", { display: "🍉", points: 1, weight: 100 }),
  new SlotSymbol("lemon", { display: "🍋", points: 1, weight: 100 }),
  new SlotSymbol("cherry", { display: "🍒", points: 1, weight: 100 }),
  new SlotSymbol("orange", { display: "🍊", points: 1, weight: 80 }),
  new SlotSymbol("grapes", { display: "🍇", points: 1, weight: 80 }),
  new SlotSymbol("speaker", { display: "🔊", points: 1, weight: 65 }),
  new SlotSymbol("bell", { display: "🔔", points: 2, weight: 50 }),
  new SlotSymbol("clover", { display: "🍀", points: 3, weight: 35 }),
  new SlotSymbol("music", { display: "🎵", points: 3, weight: 30 }),
  new SlotSymbol("dj", { display: "🎧", points: 5, weight: 15 }),
  new SlotSymbol("diamond", { display: "💎", points: 50, weight: 10 }),
  new SlotSymbol("jackpot", { display: "🃏", points: 3, weight: 3}),
  new SlotSymbol("wild", { display: "❔", points: 1, weight: 30, wildcard: true })
];

class Slots extends Command {
  constructor(client) {
    super(client, {
      name: "slots",
      description: "Bet Props in the Slot Machine",
      usage: "slots 1-20"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      //message.delete();
      
      if (!args.length) { return; }

      const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "slots@play", "perUser", message.author.id);

      if (cooldown != -2) {
        return message.reply("Hold on! You already played Slots " + Math.floor((10 - cooldown) / 60) + " second(s) ago, you must wait " + Math.ceil(cooldown / 10) + " second(s) to play again.");
      }

      const price = parseInt(args.pop(), 10);

      if (isNaN(price) || price < 1 || price > 20) {
        return false;
      }

      const user = await this.client.getUserbyDiscord(message.author.id);

      if (!isObject(user)) {
        return message.reply("You need to link your account first! Read how here: https://edmspot.ml/faq");
      }

      //const [inst] = await this.client.db.models.users.findOrCreate({ where: { id: userDB.get("id") }, defaults: { id: userDB.get("id") } });

      //const props = inst.get("props");

      //if (props < price) {
        //return message.reply("You don't have enough props.");
      //}

      //await inst.decrement("props", { by: price });
      //await this.client.db.models.users.increment("props", { by: price, where: { id: "40333310" } });

      const machine = new SlotMachine(3, symbols);
      const results = machine.play();

      let moveTo3 = false;
      let moveDown5 = false;
      let moveDown2 = false;
      let wonJackPot = false;

      //const [botUser] = await this.client.db.models.users.findOrCreate({ where: { id: "40333310" }, defaults: { id: "40333310" } });
      const jackpot = "OMEGALUL";

      message.channel.send("Current JackPot: " + jackpot + " Props");

      const embed = new Discord.MessageEmbed();
      const dollarSigns = "   💲 💲 💲   ";

      embed.description = (results.lines.slice(-2)[0].isWon ? "\n↘" : "\n⬛") + dollarSigns + (results.lines.slice(-1)[0].isWon ? "↙" : "⬛");

      if (results.lines.slice(-2)[0].isWon && results.lines.slice(-2)[0].symbols.map(s => s.name).includes("dj")) {
        moveTo3 = true;
      } else if (results.lines.slice(-2)[0].isWon && results.lines.slice(-2)[0].symbols.map(s => s.name).includes("music")) {
        moveDown5 = true;
      } else if (results.lines.slice(-2)[0].isWon && results.lines.slice(-2)[0].symbols.map(s => s.name).includes("speaker")) {
        moveDown2 = true;
      }
      
      if (results.lines.slice(-2)[0].isWon && results.lines.slice(-2)[0].symbols.map(s => s.name).includes("jackpot")) {
        wonJackPot = true;
      }

      for (let i = 0; i < results.lines.length - 2; i++) {
        embed.description += (results.lines[i].isWon ? "\n➡   " : "\n⬛   ") + results.lines[i].symbols.map(s => s.display).join(" ") + (results.lines[i].isWon ? "   ⬅" : "   ⬛");

        if (results.lines[i].isWon && results.lines[i].symbols.map(s => s.name).includes("dj")) {
          moveTo3 = true;
        } else if (results.lines[i].isWon && results.lines[i].symbols.map(s => s.name).includes("music")) {
          moveDown5 = true;
        } else if (results.lines[i].isWon && results.lines[i].symbols.map(s => s.name).includes("speaker")) {
          moveDown2 = true;
        }
        
        if (results.lines[i].isWon && results.lines[i].symbols.map(s => s.name).includes("jackpot")) {
          wonJackPot = true;
        }
      }

      embed.description += (results.lines.slice(-1)[0].isWon ? "\n↗" : "\n⬛") + dollarSigns + (results.lines.slice(-2)[0].isWon ? "↖" : "⬛");

      if (results.lines.slice(-1)[0].isWon && results.lines.slice(-1)[0].symbols.map(s => s.name).includes("dj")) {
        moveTo3 = true;
      } else if (results.lines.slice(-1)[0].isWon && results.lines.slice(-1)[0].symbols.map(s => s.name).includes("music")) {
        moveDown5 = true;
      } else if (results.lines.slice(-1)[0].isWon && results.lines.slice(-1)[0].symbols.map(s => s.name).includes("speaker")) {
        moveDown2 = true;
      }

      if (results.lines.slice(-1)[0].isWon && results.lines.slice(-1)[0].symbols.map(s => s.name).includes("jackpot")) {
        wonJackPot = true;
      }

      const points = results.lines.reduce((total, line) => total + line.points, 0);
      const payout = price * points;

      embed.addField(
        points ? "You have won!" : "You have lost!",
        points ? `You have earned ${payout} Props` : `Lost ${price} Props. Better luck next time!`
      );

      embed.setTitle("🎰 Slot Machine 🎰");
      embed.setTimestamp();
      embed.setFooter(message.author.username, `${message.author.displayAvatarURL()}`);
      embed.setColor("#e6f90e");

      //await inst.increment("props", { by: payout });

      if (moveTo3 || moveDown5 || moveDown2) {
        const dj = await this.client.getDj();
        const userPos = await this.client.getWaitlistPos(user.id);

        if (isNil(user)) {
          message.reply("You're not online! Can't Move.");
        } else if (isObject(dj) && dj.user._id !== user._id) {
          if (moveTo3 && userPos >= 4) {
            this.client.chat("@" + user.username + " Won Spot 3 in the Slot Machine! Moving to 3...");

            this.client.queue.add(user, 3);
          } else if (moveDown5 && userPos >= 6) {
            this.client.chat("@" + user.username + " Won 5 Spots in the Slot Machine! Moving Down 5...");

            this.client.queue.add(user, userPos - 5);
          } else if (moveDown2 && userPos >= 3) {
            this.client.chat("@" + user.username + " Won 2 Spots in the Slot Machine! Moving Down 2...");

            this.client.queue.add(user, userPos - 2);
          }
        }
      }

      //const banCount = await this.client.db.models.bans.count({
        //where: { id: userDB.get("id") }
      //});

      //if (wonJackPot && banCount == 0) {
        //await inst.increment("props", { by: jackpot });
        //await botUser.decrement("props", { by: jackpot });

        //message.channel.send("Congratulation!!! You won the JackPot!");
      //}

      await this.client.redis.placeCommandOnCooldown("discord", "slots@play", "perUser", message.author.id, 10);

      return message.channel.send({ embed });
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Slots;
