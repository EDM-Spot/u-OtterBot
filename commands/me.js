const Command = require("../base/Command.js");
const Discord = require("discord.js");
const { isNil } = require("lodash");
const moment = require("moment");

class Me extends Command {
  constructor(client) {
    super(client, {
      name: "me",
      description: "Check your profile.",
      usage: "me",
      aliases: ["me"]
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    //const cooldown = await this.client.redis.getCommandOnCoolDown("discord", "me@info", "perUser", message.author.id);

    //if (cooldown != -2 && level < 9) {
      //return;
    //}

    try {
      const user = await this.client.getUserbyDiscord(message.author.id);

      if (!isNil(user)) {

        //await this.client.redis.placeCommandOnCooldown("discord", "me@info", "perUser", message.author.id, 3600);

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
        const a = await this.client.guilds.cache.get("485173051432894489").members.cache.get(message.author.id);

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
          .setAuthor(user.username, message.author.displayAvatarURL())
          .setTitle(`Discord: ${message.author.tag}`)
          .setThumbnail(userImage)
          .addField("ID", user._id, true)
          .addField("Joined Room", moment(user.createdAt).format("DD/MM/YYYY HH:mm"), true)
          .addField("Joined Discord", moment(message.member.joinedTimestamp).format("DD/MM/YYYY HH:mm"), true)
          .setFooter("EDM Spot")
          .setTimestamp();

        return await message.channel.send({ embed });
      } else {
        return await message.reply("Your Account isn't linked!");
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Me;
