const moment = require("moment");
const { isObject, isNil, get, map } = require("lodash");
const Discord = require("discord.js");

var savedMessageID;
var savedMessage;

let skipped = false;

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: "advance",
    platform,
    _filename: filename,
    run: async (next) => {
      if (isNil(next) || isNil(next.media)) return;

      var currentPlay = next.media.media;
      var currentDJ = await bot.getUser(next.userID);

      if (isNil(currentDJ._id) || isNil(currentDJ.username)) {
        return;
      }

      await bot.joinWaitlist(await bot.getSelf()._id);

      let songAuthor = null;
      let songTitle = null;

      skipped = false;

      try {
        if (currentPlay.sourceType === "youtube") {
          const YouTubeMediaData = await bot.youtube.getMedia(currentPlay.sourceID);

          const fullTitle = get(YouTubeMediaData, "snippet.title");

          const { contentDetails, status } = YouTubeMediaData;
          const uploadStatus = get(YouTubeMediaData, "status.uploadStatus");
          const privacyStatus = get(YouTubeMediaData, "status.privacyStatus");
          const embeddable = get(YouTubeMediaData, "status.embeddable");

          if (!isObject(contentDetails) || !isObject(status) || uploadStatus !== "processed" || privacyStatus === "private" || !embeddable) {
            bot.chat(bot.utils.replace(bot.check.mediaUnavailable, { which: "current" }));

            bot.channels.cache.get("695987344280649839").send(bot.utils.replace(bot.check.mediaUnavailable, { which: "current" }));
          }

          if ((fullTitle.match(/-/g) || []).length === 1) {
            songAuthor = fullTitle.split(" - ")[0].trim();
            songTitle = fullTitle.split(" - ")[1].trim();
          }
        } else {
          const SoundCloudMediaData = await bot.soundcloud.getTrack(currentPlay.sourceID);

          if (!isNil(SoundCloudMediaData)) {
            const fullTitle = SoundCloudMediaData.title;

            if ((fullTitle.match(/-/g) || []).length === 1) {
              songAuthor = fullTitle.split(" - ")[0].trim();
              songTitle = fullTitle.split(" - ")[1].trim();
            }
          }
        }
      } catch (err) {
        songAuthor = currentPlay.artist;
        songTitle = currentPlay.title;
      }

      if (isNil(songAuthor) || isNil(songTitle)) {
        songAuthor = currentPlay.artist;
        songTitle = currentPlay.title;
      }

      try {
        if (!isNil(bot.user)) {
          bot.user.setActivity(`${songAuthor} - ${songTitle}`, {
            type: "LISTENING"
          }).catch(function(error) {
            console.warn("setActivity Error!");
            console.log(error);
          });
        }
      } catch (err) {
        console.warn("setActivity Error!");
        console.log(err);
      }

      try {
        if (!isNil(bot.user)) {
          await bot.voiceUtil.play();
        }
      } catch (err) {
        console.warn("play Error!");
        console.log(err);
      }

      const blackword = ["nightcore", "nightstep", "bass boosted", "whatsapp", "gemido", "gemidão", "rape", "Nectus"];

      for (let i = 0; i < blackword.length; i++) {
        var pattern = new RegExp("\\b" + blackword[i] + "\\b");

        if (pattern.test(songAuthor.toLowerCase()) || pattern.test(songTitle.toLowerCase())) {
          //bot.plug.chat(`@${currentDJ.username} ` + bot.lang.blacklisted);

          if (!skipped) {
            //await bot.db.models.blacklist.findOrCreate({
              //where: { cid: currentPlay.cid },
              //defaults: {
                //cid: currentPlay.cid,
                //moderator: bot.plug.me().id,
              //},
            //});

            const embed = new Discord.MessageEmbed()
              //.setTitle("Title")
              .setAuthor(currentPlay.artist + " - " + currentPlay.title, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
              .setColor(0xFF00FF)
              //.setDescription("This is the main body of text, it can hold 2048 characters.")
              .setFooter("By " + await bot.getSelf().username)
              //.setImage("http://i.imgur.com/yVpymuV.png")
              //.setThumbnail("http://i.imgur.com/p2qNFag.png")
              .setTimestamp()
              //.addField("This is a field title, it can hold 256 characters")
              .addField("ID", currentDJ._id, true)
              .addField("User ", currentDJ.username, true)
              .addField("Blacklisted", " (youtube.com/watch?v=" + currentPlay.sourceID + ")", false);
            //.addBlankField(true);

            //bot.channels.cache.get("486637288923725824").send({ embed });

            //bot.chat(bot.lang.commands.blacklist.currentAdded);

            //bot.channels.cache.get("695987344280649839").send(bot.lang.commands.blacklist.currentAdded);

            await bot.skip(next.userID, "Blackwords");

            if (blackword[i] == "gemido" || blackword[i] == "gemidão" || blackword[i] == "rape") {
              //await currentDJ.ban(BAN_DURATION.PERMA, BAN_REASON.SPAMMING);
            }

            skipped = true;
          }
        }
      }

      //const blacklisted = await bot.db.models.blacklist.findOne({ where: { cid: currentPlay.cid } });

      //if (isObject(blacklisted)) {
        //if (!skipped) {
          //bot.plug.chat(`@${currentDJ.username} ` + bot.lang.blacklisted);

          //bot.channels.cache.get("695987344280649839").send(`@${currentDJ.username} ` + bot.lang.blacklisted);

          //await next.skip();
          //skipped = true;
        //}
      //}

      //const isOverplayed = await bot.utils.isSongOverPlayed(songAuthor, songTitle, currentPlay.cid);

      //if (isOverplayed) {
        //if (!skipped) {
          //bot.plug.chat(`@${currentDJ.username} ` + bot.lang.overplayed);

          //bot.channels.cache.get("695987344280649839").send(`@${currentDJ.username} ` + bot.lang.overplayed);

          //await next.skip();
          //skipped = true;
        //}
      //}

      if (isObject(currentDJ) && currentPlay.duration >= 390) {
        //const [user] = await bot.db.models.users.findOrCreate({ where: { id: currentDJ.id }, defaults: { id: currentDJ.id } });
        //const seconds = currentPlay.duration - 390;
        //const props = user.get("props");

        //const propsToPay = Math.ceil(seconds / 3);

        //if (currentPlay.duration <= 600 && props >= propsToPay) {
          //await user.decrement("props", { by: propsToPay });
          //bot.plug.chat(`${currentDJ.username} paid ${propsToPay} Props to play this song!`);

          //bot.channels.cache.get("695987344280649839").send(`${currentDJ.username} paid ${propsToPay} Props to play this song!`);
        //} else {
          if (!skipped) {
            bot.chat(`@${currentDJ.username} ` + bot.lang.exceedstimeguard);

            bot.channels.cache.get("695987344280649839").send(`@${currentDJ.username} ` + bot.lang.exceedstimeguard);

            //await bot.utils.lockskip(currentDJ);
            await bot.skip(next.userID, "Exceeds time length");
            skipped = true;
          }
        //}
      }

      //const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, currentPlay.cid);

      //if (!bot.global.ignoreHistoryNext) {
        //if (!isNil(songHistory)) {
          //if (songHistory.skip) {
            //if (!songHistory.maybe) {
              //if (!skipped) {
                //bot.plug.chat(bot.utils.replace(bot.lang.historySkip, {
                  //time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
                //}));

                //bot.channels.cache.get("695987344280649839").send(bot.utils.replace(bot.lang.historySkip, {
                  //time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
                //}));

                //await next.skip();
                //skipped = true;
              //}
            //} else {
              //bot.plug.chat(bot.utils.replace(bot.lang.maybeHistorySkip, {
                //cid: map(songHistory, "cid")[0],
                //time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
              //}));

              //bot.channels.cache.get("695987344280649839").send(bot.utils.replace(bot.lang.maybeHistorySkip, {
                //cid: map(songHistory, "cid")[0],
                //time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
              //}));
            //}
          //}
        //}
      //}

      //const savedID = currentPlay._id;

      //setTimeout(async () => {
        //const timeoutMedia = bot.plug.historyEntry();

        //if (savedID === get(timeoutMedia.media, "id")) {
          //if (!skipped) {
            //bot.plug.chat(bot.lang.stuckSkip);

            //bot.channels.cache.get("695987344280649839").send(bot.lang.stuckSkip);

            //bot.global.isSkippedByTimeGuard = true;

            //await timeoutMedia.skip();
            //skipped = true;
          //}
        //}
      //}, (currentPlay.duration + 10) * 1e3);
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