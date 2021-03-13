// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform
// you.
if (Number(process.version.slice(1).split(".")[0]) < 12) throw new Error("Node 12.0.0 or higher is required. Update Node on your system.");

// Load up the discord.js library
const Discord = require("discord.js");
const WebSocket = require("ws");
const EventEmitter = require("events");

// We also load the rest of the things we need in this file:
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");
const klaw = require("klaw");
const path = require("path");
const once = require("once");
const axios = require("axios");
const Redis = require("ioredis");
const Mongoose = require("mongoose");
Mongoose.Promise = Promise;

const ModuleManager = require("./Modules");

const Deck = require("./util/poker/deck.js");

const API_URL = "https://edmspot.ml/api";
const SOCKET_URL = "wss://edmspot.ml";

const AUTH_LOGIN = "auth/login";
const AUTH_SOCKET = "auth/socket";

class Bot extends Discord.Client {
  constructor(options) {
    super(options);

    // Here we load the config.js file that contains our token and our prefix values.
    this.config = require("./config.js");
    // client.config.token contains the bot's token
    // client.config.prefix contains the message prefix

    this.socket;

    this.socketEvents = new EventEmitter();

    this.self;

    this.mongoose = Mongoose;

    this.moment = require("moment");

    this.lang = require("./Modules/data/lang.json");

    this.models = {};

    this.Redis = new Redis(this.config.db.redis);
    this.db = this.mongoose.createConnection(this.config.db.mongo, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    // Aliases and commands are put in collections where they can be read from,
    // catalogued, listed, etc.
    this.commands = new Discord.Collection();
    this.aliases = new Discord.Collection();

    // Now we integrate the use of Evie's awesome Enhanced Map module, which
    // essentially saves a collection to disk. This is great for per-server configs,
    // and makes things extremely easy for this purpose.
    this.settings = new Enmap({ name: "settings" });

    //requiring the Logger class for easy console logging
    this.logger = require("./util/Logger");

    // Basically just an async shortcut to using a setTimeout. Nothing fancy!
    this.wait = promisify(setTimeout);
  }

  async connectSocket() {
    this.shouldClose = false;

    await axios.get(`${API_URL}/${AUTH_SOCKET}`)
      .then(async response => {
        await new Promise((resolve, reject) => {
          let sent = false;

          this.socket = new WebSocket(SOCKET_URL);

          this.socket.on("open", () => {
            sent = true;
            this.socket.send(response.data.data.socketToken);
            resolve();
          });

          this.socket.on("message", this.onSocketMessage.bind(this));

          const reconnect = once(() => {
            console.log("reconnecting in 1000ms");
            setTimeout(() => {
              this.connectSocket();
            }, 1000);
          });

          this.socket.on("error", (err) => {
            console.log(err);
            if (!sent) reject(err);
            else reconnect();
          });

          this.socket.on("close", () => {
            console.log("closed");
            if (!this.shouldClose && sent) reconnect();
          });
        });
      }).catch(error => console.log("Error", error));
  }

  async getSocketAuth() {
    const body = await axios.get(`${API_URL}/${AUTH_SOCKET}`);

    return body.data.socketToken;
  }

  onSocketMessage(message) {
    if (message === "-") {
      return;
    }

    let command;
    let data;

    try {
      ({ command, data } = JSON.parse(message));
    } catch (e) {
      console.error(e.stack || e);
      return;
    }

    this.socketEvents.emit(command, data);

    //if (command in this.socketHandlers) {
    //  this.socketHandlers[command].call(this, data);
    //}
  }

  chat(text) {
    const message = JSON.stringify({
      command: "sendChat",
      data: text
    });

    this.socket.send(message);
  }

  async getSelf() {
    const body = await axios.get(`${API_URL}/now`).catch(function(error) { console.log(error); });

    return body.data.user;
  }

  async getUsers() {
    const body = await axios.get(`${API_URL}/now`).catch(function(error) { console.log(error); });

    return body.data.users;
  }

  async getUser(id) {
    const body = await axios.get(`${API_URL}/users/${id}`).catch(function(error) { console.log(error); });

    return body.data.data;
  }

  async getUserbyDiscord(id) {
    const users = await this.getUsers();

    return users.find((user) => user.discordId === id);
  }

  async getDj() {
    const body = await axios.get(`${API_URL}/booth`).catch(function(error) { console.log(error); });
    const user = await this.getUser(body.data.data.userID);

    body.data.data.media.user = user;
    body.data.data.media.stats = body.data.data.stats;

    body.data.data.media.historyID = body.data.data.historyID;
    body.data.data.media.playedAt = body.data.data.playedAt;

    return body.data.data.media;
  }

  async getWaitlist() {
    const body = await axios.get(`${API_URL}/waitlist`).catch(function(error) { console.log(error); });

    return body.data.data;
  }

  async getWaitlistPos(id) {
    const waitlist = await this.getWaitlist();

    return waitlist.find((user) => user._id === id);
  }

  async delete(id) {
    return await axios.delete(`${API_URL}/chat/${id}`).catch(function(error) { console.log(error); });
  }

  async skip(userID, reason) {
    return await axios.post(`${API_URL}/booth/skip`, {
      userID,
      reason,
      remove: false
    }).catch(function(error) { console.log(error); });
  }

  async joinWaitlist(userID) {
    return await axios.post(`${API_URL}/waitlist`, {
      userID
    });
  }

  async leaveWaitlist() {
    return await axios.delete(`${API_URL}/waitlist`, {
      data: {
        id: "60247370d5cc5241eabcb1e7"
      }
    }).catch(function(error) { console.log(error); });
  }

  async getPlaylistItems() {
    const body = await axios.get(`${API_URL}/playlists/603eb8030e00b6dc1327dc5c/media?page[offset]=0&page[limit]=500`).catch(function(error) { console.log(error); });

    return body.data.data;
  }

  async deletePlaylistItems(currentList) {
    return await axios.delete(`${API_URL}/playlists/603eb8030e00b6dc1327dc5c/media`, {
      data: {
        items: currentList
      }
    }).catch(function(error) { console.log(error); });
  }

  async insertMedia(item) {
    return await axios.post(`${API_URL}/playlists/603eb8030e00b6dc1327dc5c/media`, {
      items: item,
      at: "end"
    }).catch(function(error) { console.log(error); });
  }

  async shufflePlaylist() {
    return await axios.post(`${API_URL}/playlists/603eb8030e00b6dc1327dc5c/shuffle`).catch(function(error) { console.log(error); });
  }

  async getRoomHistory() {
    const body = await axios.get(`${API_URL}/booth/history?page[offset]=0&page[limit]=100`).catch(function(error) { console.log(error); });

    return body.data.data;
  }

  async isLocked() {
    const body = await axios.get(`${API_URL}/now`).catch(function(error) { console.log(error); });

    return body.data.waitlistLocked;
  }

  async setLock() {
    return await axios.get(`${API_URL}/waitlist/lock`).catch(function(error) { console.log(error); });
  }

  /*
  PERMISSION LEVEL FUNCTION

  This is a very basic permission system for commands which uses "levels"
  "spaces" are intentionally left black so you can add them if you want.
  NEVER GIVE ANYONE BUT OWNER THE LEVEL 10! By default this can run any
  command including the VERY DANGEROUS `eval` command!

  */
  permlevel(message) {
    let permlvl = 0;

    const permOrder = client.config.permLevels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);

    while (permOrder.length) {
      const currentLevel = permOrder.shift();
      if (message.guild && currentLevel.guildOnly) continue;
      if (currentLevel.check(message)) {
        permlvl = currentLevel.level;
        break;
      }
    }
    return permlvl;
  }

  checklevel(id) {
    const guild = client.guilds.cache.get("485173051432894489");
    const member = client.guilds.cache.get("485173051432894489").members.cache.get(id);
    const settings = client.getSettings("485173051432894489");

    const managerRole = guild.roles.cache.find(r => r.name.toLowerCase() === settings.adminRole.toLowerCase());
    const bouncerRole = guild.roles.cache.find(r => r.name.toLowerCase() === settings.modRole.toLowerCase());

    if (client.config.ownerID === id) return 10;
    if (client.config.admins.includes(id)) return 9;
    if (client.config.support.includes(id)) return 8;
    if (guild.ownerID === id) return 4;
    if (member.roles.cache.has(managerRole.id)) return 3;
    if (member.roles.cache.has(bouncerRole.id)) return 2;
    return 1;
  }

  /* 
  COMMAND LOAD AND UNLOAD
  
  To simplify the loading and unloading of commands from multiple locations
  including the index.js load loop, and the reload function, these 2 ensure
  that unloading happens in a consistent manner across the board.
  */

  loadCommand(commandPath, commandName) {
    try {
      const props = new (require(`${commandPath}${path.sep}${commandName}`))(this);
      this.logger.log(`Loading Command: ${props.help.name}. 👌`, "log");
      props.conf.location = commandPath;
      if (props.init) {
        props.init(this);
      }
      this.commands.set(props.help.name, props);
      props.conf.aliases.forEach(alias => {
        this.aliases.set(alias, props.help.name);
      });
      return false;
    } catch (e) {
      console.log(e);
      return `Unable to load command ${commandName}: ${e}`;
    }
  }

  async unloadCommand(commandPath, commandName) {
    let command;
    if (this.commands.has(commandName)) {
      command = this.commands.get(commandName);
    } else if (this.aliases.has(commandName)) {
      command = this.commands.get(this.aliases.get(commandName));
    }
    if (!command) return `The command \`${commandName}\` doesn"t seem to exist, nor is it an alias. Try again!`;

    if (command.shutdown) {
      await command.shutdown(this);
    }
    delete require.cache[require.resolve(`${commandPath}${path.sep}${commandName}.js`)];
    return false;
  }

  /* SETTINGS FUNCTIONS
  These functions are used by any and all location in the bot that wants to either
  read the current *complete* guild settings (default + overrides, merged) or that
  wants to change settings for a specific guild.
  */

  // getSettings merges the client defaults with the guild settings. guild settings in
  // enmap should only have *unique* overrides that are different from defaults.
  getSettings(guild) {
    const defaults = client.config.defaultSettings || {};
    const guildData = client.settings.get(guild.id) || {};
    const returnObject = {};
    Object.keys(defaults).forEach((key) => {
      returnObject[key] = guildData[key] ? guildData[key] : defaults[key];
    });
    return returnObject;
  }

  // writeSettings overrides, or adds, any configuration item that is different
  // than the defaults. This ensures less storage wasted and to detect overrides.
  writeSettings(id, newSettings) {
    const defaults = this.settings.get("default");
    let settings = this.settings.get(id);
    if (typeof settings != "object") settings = {};
    for (const key in newSettings) {
      if (defaults[key] !== newSettings[key]) {
        settings[key] = newSettings[key];
      } else {
        delete settings[key];
      }
    }
    this.settings.set(id, settings);
  }

  /*
  MESSAGE CLEAN FUNCTION

  "Clean" removes @everyone pings, as well as tokens, and makes code blocks
  escaped so they're shown more easily. As a bonus it resolves promises
  and stringifies objects!
  This is mostly only used by the Eval and Exec commands.
  */
  async clean(text) {
    if (text && text.constructor.name == "Promise")
      text = await text;
    if (typeof text !== "string")
      text = require("util").inspect(text, { depth: 0 });

    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
      .replace(this.token, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");

    return text;
  }

  /*
  SINGLE-LINE AWAITMESSAGE

  A simple way to grab a single reply, from the user that initiated
  the command. Useful to get "precisions" on certain things...

  USAGE

  const response = await client.awaitReply(msg, "Favourite Color?");
  msg.reply(`Oh, I really love ${response} too!`);
  */
  async awaitReply(msg, question, limit = 60000) {
    const filter = m => m.author.id === msg.author.id;
    await msg.channel.send(question);
    try {
      const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
      return collected.first().content;
    } catch (e) {
      return false;
    }
  }

  getUserFromMention(mention) {
    if (!mention) return;

    if (mention.startsWith("<@") && mention.endsWith(">")) {
      mention = mention.slice(2, -1);

      if (mention.startsWith("!")) {
        mention = mention.slice(1);
      }

      return client.users.cache.get(mention);
    }
  }
}

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`,
// or `bot.something`, this is what we're refering to. Your client.
const client = new Bot();

// We're doing real fancy node 8 async/await stuff here, and to do that
// we need to wrap stuff in an anonymous function. It's annoying but it works.

const init = async () => {
  ModuleManager(client).then(async () => {
    client.events.init();

    await axios.post(`${API_URL}/${AUTH_LOGIN}`, {
      email: client.config.edmspot.email,
      password: client.config.edmspot.password
    }).then(async response => {
      if (response.data && response.data.meta && response.data.meta.jwt) {
        //client.token = response.data.meta.jwt;
        axios.defaults.headers.common["authorization"] = `JWT ${response.data.meta.jwt}`;

        await client.connectSocket();
      } else {
        throw new Error("Could not log in.");
      }
    }).catch(error => console.log("Error", error));

    console.info("[!] Modules Loaded [!]");
  });

  // Here we load **commands** into memory, as a collection, so they're accessible
  // here and everywhere else.
  klaw("./commands").on("data", (item) => {
    const cmdFile = path.parse(item.path);
    if (!cmdFile.ext || cmdFile.ext !== ".js") return;
    const response = client.loadCommand(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
    if (response) client.logger.error(response);
  });

  // Then we load events, which will include our message and ready event.
  const evtFiles = await readdir("./events/");
  client.logger.log(`Loading a total of ${evtFiles.length} events.`, "log");
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    const event = new (require(`./events/${file}`))(client);
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, (...args) => event.run(...args));
    delete require.cache[require.resolve(`./events/${file}`)];
  });

  client.levelCache = {};
  for (let i = 0; i < client.config.permLevels.length; i++) {
    const thisLevel = client.config.permLevels[i];
    client.levelCache[thisLevel.name] = thisLevel.level;
  }

  // Here we login the client.
  client.login(client.config.token);

  // End top-level async/await function.

  await Deck.loadAssets();
};

init();

client.on("shardDisconnected", (event, shardID) => client.logger.warn("Bot is disconnecting..."))
  .on("shardReconnecting", id => client.logger.log("Bot reconnecting...", "log"))
  .on("error", e => client.logger.error(e))
  .on("warn", info => client.logger.warn(info));

client.socketEvents.on("disconnected", async () => {
  console.warn("!! Connection to EDMSpot Lost.");
  await reconnect();
});

let timeout = 0;
async function reconnect() {
  console.info("Trying to reconnect to EDMSpot...");

  await axios.post(`${API_URL}/${AUTH_LOGIN}`, {
    email: client.config.edmspot.email,
    password: client.config.edmspot.password
  }).then(async response => {
    if (response.data && response.data.meta && response.data.meta.jwt) {
      //client.token = response.data.meta.jwt;
      axios.defaults.headers.common["authorization"] = `JWT ${response.data.meta.jwt}`;

      await client.connectSocket();
    } else {
      throw new Error("Could not log in.");
    }
  }).catch(() => {
    console.warn("Failed to reconnect, trying again in", timeout, "ms");
    setTimeout(reconnect, timeout);
  });

  timeout += 1000; // 1 second
}

/* MISCELANEOUS NON-CRITICAL FUNCTIONS */

// EXTENDING NATIVE TYPES IS BAD PRACTICE. Why? Because if JavaScript adds this
// later, this conflicts with native code. Also, if some other lib you use does
// this, a conflict also occurs. KNOWING THIS however, the following 2 methods
// are, we feel, very useful in code. 

// <String>.toPropercase() returns a proper-cased string such as: 
// "Mary had a little lamb".toProperCase() returns "Mary Had A Little Lamb"
Object.defineProperty(String.prototype, "toProperCase", {
  value: function () {
    return this.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
});
// <Array>.random() returns a single random element from an array
// [1, 2, 3, 4, 5].random() can return 1, 2, 3, 4 or 5.
Object.defineProperty(Array.prototype, "random", {
  value: function () {
    return this[Math.floor(Math.random() * this.length)];
  }
});

Object.defineProperty(String.prototype, "capitalize", {
  value: function capitalize() {
    return this[0].toUpperCase() + this.slice(1);
  }
});

Object.defineProperty(Number.prototype, "plural", {
  value: function plural(singularText, pluralText, withNumber = false) {
    if (Math.abs(this) === 1) return (withNumber ? this : "") + singularText;
    return (withNumber ? this : "") + pluralText;
  }
});

// These 2 process methods will catch exceptions and give *more details* about the error and stack trace.
process.on("uncaughtException", (err) => {
  const errorMsg = err.stack.replace(new RegExp(process.cwd().replace(/\\/g, "\\\\"), "g"), ".");
  client.logger.error("Uncaught Exception: ", errorMsg);
  // Always best practice to let the code crash on uncaught exceptions. 
  // Because you should be catching them anyway.
  process.exit(1);
});

process.on("unhandledRejection", err => {
  if (err.stack) err = err.stack.replace(new RegExp(process.cwd().replace(/\\/g, "\\\\"), "g"), ".");
  client.logger.error("Unhandled rejection: ", err);
});