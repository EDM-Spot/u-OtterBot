const Command = require("../base/Command.js");
const { isNil } = require("lodash");

class UpdateRoles extends Command {
  constructor(client) {
    super(client, {
      name: "updateroles",
      description: "Update Roles.",
      usage: "updateroles",
      aliases: ["updateroles"],
      permLevel: "Bot Developer"
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    message.guild.members.fetch().then(async members => {
      members.forEach(async member => {
        try {
          const userDB = await this.client.db.models.users.findOne({
            discordId: member.user.id,
          });

          if (!isNil(userDB)) {
            console.log("Checking " + member.user.username);

            const statusRole = "695994210603630633";

            if (member.roles.has(statusRole)) {
              await member.roles.add(statusRole).catch(console.warn);

              console.log(member.user.username + " Account is linked!");
            }
          } else {
            const statusRole = "695994210603630633";

            await member.roles.remove(statusRole).catch(console.warn);

            console.log(member.user.username + " Role Removed");
          }
        }
        catch {
          ///Error
        }
      });
    }).catch(console.warn);
  }
}

module.exports = UpdateRoles;
