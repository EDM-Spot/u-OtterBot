module.exports = function Command(bot) {
  bot.uCommands.register({
    names: ["hello"],
    minimumPermission: 1000,
    cooldownType: "perUse",
    cooldownDuration: 120,
    parameters: "",
    description: "Hello...",
    async execute(rawData) {
      const lucky = !Math.floor(Math.random() * 50);

      if (lucky) {
        rawData.reply('hello...').delay(4500);
        bot.chat('... it\'s me...');
        return true;
      }

      bot.chat(`Hi There, @${rawData.un}`);
      return true;
    },
  });
};