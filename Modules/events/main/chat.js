const { each, isNil } = require("lodash");
const moment = require("moment");
const Discord = require("discord.js");

module.exports = function Event(bot, platform) {
  const event = {
    name: "chatMessage",
    platform,
    run: async (rawData) => {
      const commandHandleRegex = /^(\/(em|me)\s)?!/;
      const emoteRegex = /^\/(em|me)\s/;
      rawData.timestamp = Date.now();

      const messageUser = await bot.getUser(rawData.userID);

      rawData.un = messageUser.username;
      rawData.uid = rawData.userID;

      //const message = await bot.db.models.messages.create({
      //id: rawData.uid,
      //cid: rawData.id,
      //username: rawData.un,
      //message: rawData.message,
      //});

      //try {
      //await bot.db.models.users.update(
      //{ username: rawData.un, last_seen: moment() },
      //{ where: { id: rawData.uid }, defaults: { id: rawData.uid } }
      //);
      //}
      //catch (err) {
      //console.warn(err);
      //console.log(rawData);
      //}

      //if (messageUser.role < ROLE.BOUNCER) {
      if (/(skip)/ig.test(rawData.message)) {
        await bot.delete(rawData.id);
        return;
      }
      //}

      if (/(skip pls)|(pls skip)|(skip this shit)|(mods skip this)|(faggot)|(socket app)/ig.test(rawData.message)) {
        await bot.delete(rawData.id);
        return;
      }

      if (/(nigger)|(n i g g e r)|(kys)|(kill yourself)/ig.test(rawData.message)) {
        await bot.delete(rawData.id);

        //await messageUser.ban(BAN_DURATION.PERMA, BAN_REASON.SPAMMING);
        return;
      }

      if (commandHandleRegex.test(rawData.message)) {
        const splitMessage = rawData.message.replace(emoteRegex, "").split(" ");

        const cmd = rawData.message.split(" ")[0];
        let messageArgs = rawData.message.substr(cmd.length + 1);

        let i;
        const random = Math.ceil(Math.random() * 1E10);
        const messageMentions = [];

        if (!isNil(messageArgs)) {
          let lastIndex = -1;
          let allUsers = await bot.getUsers();

          if (allUsers.length > 0) {
            allUsers = allUsers.sort((a, b) => {
              if (Object.is(a.username.length, b.username.length)) {
                return 0;
              }

              return a.username.length < b.username.length ? -1 : 1;
            });

            for (const user of allUsers) {
              lastIndex = messageArgs.toLowerCase().indexOf(user.username.toLowerCase());

              if (lastIndex > -1) {
                messageArgs = `${messageArgs.substr(0, lastIndex).replace("@", "")}%MENTION-${random}-${messageMentions.length}% ${messageArgs.substr(lastIndex + user.username.length + 1)}`;
                messageMentions.push(user);
              }
            }
          }

          messageArgs = messageArgs.split(" ").filter((item) => item != null && !Object.is(item, ""));

          for (i = 0; i < messageArgs.length; i++) {
            if (isFinite(Number(messageArgs[i])) && !Object.is(messageArgs[i], "")) {
              messageArgs[i] = Number(messageArgs[i]);
            }
          }
        }

        if (messageMentions.length > 0) {
          for (i = 0; i < messageMentions.length; i++) {
            const atIndex = messageArgs.indexOf(`@%MENTION-${random}-${i}%`);
            const normalIndex = messageArgs.indexOf(`%MENTION-${random}-${i}%`);

            if (normalIndex > -1) {
              messageArgs[normalIndex] = messageMentions[i];
            }
            if (atIndex > -1) {
              messageArgs[atIndex] = messageMentions[i];
            }
          }
        }

        const command = {
          name: splitMessage[0].replace(commandHandleRegex, "").toLowerCase(),
          args: messageArgs,
          mentions: messageMentions,
          platform,
        };

        each(bot.botCommands.getLoaded(), async (registeredCommand) => {
          if (registeredCommand.names.includes(command.name)) {
            //await message.update({ command: true });
            command.registeredCommand = registeredCommand;
            new bot.botCommands.Class(bot, rawData, command);
          }
        });
      }

      if (/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(rawData.message)) {
        setTimeout(async () => await bot.delete(rawData.id), 3e5);
      }

      const botID = await bot.getSelf();
      if (!commandHandleRegex.test(rawData.message)) {
        if (rawData.uid !== botID._id) {
          bot.channels.cache.get("695987344280649839").send(rawData.un + ": " + rawData.message.replace("@", ""));
        }
      }

      if (!commandHandleRegex.test(rawData.message)) {
        if (isNil(bot.lottery.timer)) return;
        if (bot.lottery.timer.isStarted) {
          if (rawData.uid !== botID._id) {
            if (moment().valueOf() > bot.lottery.canJoinDate.valueOf()) {
              bot.lottery.add(rawData.uid);
            }
          }
        }
      }
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