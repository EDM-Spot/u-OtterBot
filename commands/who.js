const Command = require("../base/Command.js");
const Discord = require("discord.js");
const { isNil, isObject } = require("lodash");
const moment = require("moment");

class Who extends Command {
  constructor(client) {
    super(client, {
      name: "who",
      description: "Check someone profile.",
      usage: "who @user|id",
      aliases: ["who"]
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "who@info", "perUser", message.author.id);

    const discordMention = this.client.getUserFromMention(args[0]);
    let idMention;

    if (!discordMention) {
      idMention = await this.client.getUser(args[0]);

      if (!idMention) { return; }
    }

    if (cooldown != -2 && level < 9) {
      return;
    }

    try {
      let user;

      if (discordMention) {
        user = await this.client.getUserbyDiscord(discordMention.id);
      } else {
        user = await this.client.getUser(idMention.id);
      }

      if (isObject(user)) {

        await this.client.redis.placeCommandOnCooldown("discord", "who@info", "perUser", message.author.id, 3600);

        //const propsGiven = await this.client.db.models.props.count({ where: { id: userDB.id } });

        //const playsCount = await this.client.db.models.plays.count({
        //where: { dj: userDB.id, skipped: false }
        //});

        //const songVotes = await this.client.db.models.plays.findAll({
        //attributes: [
        //[fn("SUM", col("plays.woots")
        //), "totalwoots"],
        //[fn("SUM", col("plays.grabs")
        //), "totalgrabs"]],
        //where: {
        //dj: userDB.id,
        //skipped: false
        //},
        //group: ["dj"]
        //});

        //const songVotesMehs = await this.client.db.models.plays.findAll({
        //attributes: [
        //[fn("SUM", col("plays.mehs")
        //), "totalmehs"]],
        //where: {
        //dj: userDB.id
        //},
        //group: ["dj"]
        //});

        let color;
        const a = await this.client.guilds.cache.get("485173051432894489").members.cache.get(user.discordId);

        if (isNil(a)) {
          return await message.reply("User not in discord!");
        }

        if (await a.roles.cache.get("490618109347233804")) {
          color = "#d1aa0d";
        } else if (await a.roles.cache.get("485175393054097416")) {
          color = "#cc3333";
        } else if (await a.roles.cache.get("485175078867304488")) {
          color = "#9b40e7";
        } else if (await a.roles.cache.get("485774995163971597")) {
          color = "#9b40e7";
        } else if (await a.roles.cache.get("485174834448564224")) {
          color = "#33ccff";
        } else {
          color = "#b8b8b8";
        }

        const userImage = user.avatar;

        const embed = new Discord.MessageEmbed()
          .setColor(color)
          .setAuthor(user.username, a.user.displayAvatarURL())
          .setTitle(`Discord: ${a.user.tag}`)
          .setThumbnail(userImage)
          .addField("ID", user._id, true)
          .addField("Joined Room", moment(user.createdAt).format("DD/MM/YYYY HH:mm"), true)
          .addField("Joined Discord", moment(a.joinedTimestamp).format("DD/MM/YYYY HH:mm"), true)
          .setFooter("EDM Spot")
          .setTimestamp();

        return await message.channel.send({ embed });
      } else {
        return await message.reply("This Account isn't linked!");
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Who;
