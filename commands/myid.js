const Command = require("../base/Command.js");

class MyID extends Command {
  constructor(client) {
    super(client, {
      name: "myid",
      description: "Check your Discord ID.",
      usage: "myid",
      aliases: ["myid"]
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      return await message.reply("You Discord ID is: " + message.author.id);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = MyID;
