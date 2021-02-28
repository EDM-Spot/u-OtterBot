const { each, isNil } = require("lodash");
const moment = require("moment");
const Discord = require("discord.js");
const { Op } = require("sequelize");

module.exports = function Event(bot, platform) {
  const event = {
    name: "chatMessage",
    platform,
    run: async (rawData) => {
      const commandHandleRegex = /^(\/(em|me)\s)?!/;
      const emoteRegex = /^\/(em|me)\s/;
      rawData.timestamp = Date.now();

      const user = await bot.getUser(rawData.userID);

      rawData.un = user.username;

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

        each(bot.uCommands.getLoaded(), async (registeredCommand) => {
          if (registeredCommand.names.includes(command.name)) {
            //await message.update({ command: true });
            command.registeredCommand = registeredCommand;
            new bot.uCommands.Class(bot, rawData, command);
          }
        });
      }

      return;

      //Anti-Spam
      try {
        const messageHistory = await bot.db.models.messages.count({
          where: {
            createdAt: {
              [Op.gte]: bot.moment().subtract(30, "seconds").toDate()
            },
            id: rawData.userID,
            message: rawData.message
          },
          order: [["createdAt", "DESC"]],
        });

        switch (messageHistory) {
          case (5):
            await rawData.delete();
            bot.chat(`@${rawData.user.username}, Please refrain from spamming! 30 Seconds.`);

            break;
          case (6):
            await rawData.delete();
            bot.chat(`@${rawData.user.username}, Please refrain from spamming! Last Warning.`);

            break;
          case (7):
            await rawData.delete();

            break;
          default:
            break;
        }

        if (messageHistory > 7) { await rawData.delete(); }
      }
      catch (err) {
        console.warn(err);
        console.log(rawData);
      }

      const message = await bot.db.models.messages.create({
        id: rawData.userID,
        cid: rawData.id,
        username: user.username,
        message: rawData.message,
      });

      try {
        await bot.db.models.users.update(
          { username: user.username, last_seen: moment() },
          { where: { id: rawData.userID }, defaults: { id: rawData.userID } }
        );
      }
      catch (err) {
        console.warn(err);
        console.log(rawData);
      }

      if (/(skip pls)|(pls skip)|(skip this shit)|(mods skip this)|(faggot)|(socket app)/ig.test(rawData.message)) {
        await rawData.delete();
        return;
      }

      if (/(nigger)|(n i g g e r)|(kys)|(kill yourself)/ig.test(rawData.message)) {
        await rawData.delete();

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
          let allUsers = bot.plug.users();

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

        each(bot.uCommands.getLoaded(), async (registeredCommand) => {
          if (registeredCommand.names.includes(command.name)) {
            await message.update({ command: true });
            command.registeredCommand = registeredCommand;
            new bot.uCommands.Class(bot, rawData, command);
          }
        });
      }

      const dubtrack = /^(?=.*join)(?=.*dubtrack.fm)/i;
      const plug = /(plug\.dj\/)(?!edmspot\b|about\b|ba\b|forgot-password\b|founders\b|giftsub\/\d|jobs\b|legal\b|merch\b|partners\b|plot\b|privacy\b|purchase\b|subscribe\b|team\b|terms\b|press\b|_\/|@\/|!\/)(.+)/i;

      if (/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(rawData.message)) {
        setTimeout(() => rawData.delete(), 3e5);
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