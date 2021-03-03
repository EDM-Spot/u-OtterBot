const moment = require("moment");
require("moment-timer");

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: "join",
    platform,
    _filename: filename,
    run: async (data) => {
      if (data._id !== await bot.getSelf()._id) return;

      bot.chat(bot.lang.startup);

      //const user = bot.plug.users();
      //for (var i = 0; i < user.lenght; i++) {
        //await bot.db.models.users.findOrCreate({
          //where: { id: user[i].id }, defaults: { id: user[i].id, username: user[i].username }
        //});
      //}
      
      console.info("[!] Connected!");

      var randomTimedText = [
        "Join our Discord https://discord.gg/QvvD8AC",
        "Don't forget to read our Rules https://edmspot.ml/rules",
        "Want a custom Badge? See how here: https://edmspot.ml/faq",
        "Link your account with discord to be able to play discord games and more! See how here: https://edmspot.ml/faq",
        "Think you can be a good addition to the staff? Apply here: https://tinyurl.com/edmspotstaffapp",
        "Start a Trivia Game with -triviapay 1-3 in Discord! https://discord.gg/QvvD8AC",
        "Play Slot Machine with -slots 1-20 in Discord! https://discord.gg/QvvD8AC"
      ];

      let randomText = new moment.duration(90, "minutes").timer({loop: true, start: true}, async () => {
        var randomNumber = Math.floor(Math.random() * randomTimedText.length);
        bot.chat(randomTimedText[randomNumber]);
      });

      let timeCover = new moment.duration(60, "minutes").timer({loop: true, start: true, executeAfterWait: true}, async () => {
        await bot.utils.timeCover();
      });

      let randomRoulette = new moment.duration(120, "minutes").timer({loop: true, start: true}, async () => {
        await bot.roulette.autoStart();
      });

      await bot.lottery.start();
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