const uCommands = require("./commands");
const Classes = require("./classes");
const Events = require("./events");
const Models = require("./models");
const Utils = require("./utils");

module.exports = function ModuleManager(bot) {
  bot.Classes = Classes;
  bot.utils = new Utils(bot);
  bot.events = new Events(bot, ["plug"]);
  bot.uCommands = new uCommands(bot);
  bot.models = new Models(bot, bot.sequelize);

  return Promise.all([
    bot.utils.processor,
    bot.db.models.processor,
    bot.events.processor,
    bot.uCommands.processor,
  ]);
};