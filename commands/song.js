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
    return message.reply("Not Implemented");
    try {
      const currentMedia = this.client.plug.historyEntry();
      await message.reply("**Current Song Playing:** https://youtu.be/" + currentMedia.media.cid);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Song;
