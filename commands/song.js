const Command = require("../base/Command.js");

class Song extends Command {
  constructor(client) {
    super(client, {
      name: "song",
      description: "Current song playing.",
      usage: "song",
      aliases: ["song"]
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    try {
      const currentDJ = await this.client.getDj();
      
      await message.reply("**Current Song Playing:** https://youtu.be/" + currentDJ.media.sourceID);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Song;
