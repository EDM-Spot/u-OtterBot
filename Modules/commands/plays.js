const { isObject, isNil, has, get, map } = require("lodash");

module.exports = function Command(bot) {
  bot.botCommands.register({
    names: ["plays", "lastplayed"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 60,
    parameters: "[YouTube Link|SoundCloud Link]",
    description: "Checks the specified link, or the current media, for the last time it was played in the community.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars    
      if (!args.length) {
        const dj = await bot.getDj();

        if (isNil(dj)) {
          this.reply(lang.plays.nothingPlaying, {});
          return false;
        }

        //if (rawData.uid == dj.id) { return false; }

        let songAuthor = null;
        let songTitle = null;

        try {
          if (dj.media.sourceType === "youtube") {
            const YouTubeMediaData = await bot.youtube.getMedia(dj.media.sourceID);

            const fullTitle = get(YouTubeMediaData, "snippet.title");

            songAuthor = fullTitle.split(" - ")[0].trim();
            songTitle = fullTitle.split(" - ")[1].trim();
          } else {
            const SoundCloudMediaData = await bot.soundcloud.getTrack(dj.media.sourceID);

            if (!isNil(SoundCloudMediaData)) {
              const fullTitle = SoundCloudMediaData.title;

              songAuthor = fullTitle.split(" - ")[0].trim();
              songTitle = fullTitle.split(" - ")[1].trim();
            }
          }
        }
        catch (err) {
          songAuthor = dj.media.artist;
          songTitle = dj.media.title;
        }

        if (isNil(songAuthor) || isNil(songTitle)) {
          songAuthor = dj.media.artist;
          songTitle = dj.media.title;
        }

        const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, dj.media.sourceID);

        if (isNil(songHistory)) {
          this.reply(lang.plays.neverPlayed, { which: lang.plays.current });
          return true;
        } else {
          if (!songHistory.maybe) {
            //Todo: Use DB historyentry
            let playsCount = 0;
            const roomHistory = await bot.getRoomHistory();
            const notSongHistory = roomHistory.shift();

            for (var i = 0; i < notSongHistory.length; i++) {
              if (notSongHistory[i].media.sourceID == map(songHistory, "media.sourceID")[0]) {
                playsCount++;
              }
            }

            if (playsCount < 1) {
              this.reply(lang.plays.lastPlaySkippedWas, {
                which: lang.plays.current,
                time: bot.moment(map(songHistory, "playedAt")[0]).fromNow(),
              });
              return true;
            }

            this.reply(lang.plays.lastPlayWas, {
              which: lang.plays.current,
              time: bot.moment(map(songHistory, "playedAt")[0]).fromNow(),
              count: playsCount,
            });
            return true;
          } else {
            if (songHistory.media.sourceType === "youtube") {
              this.reply(lang.plays.maybeLastPlayWas, {
                which: lang.plays.current,
                cid: map(songHistory, "media.sourceID")[0],
                time: bot.moment(map(songHistory, "playedAt")[0]).fromNow(),
              });
              return true;
            }
          }
        }
      }

      const link = args.shift();

      if (isNil(link)) return;

      const cid = bot.youtube.getMediaID(link);

      if (!isNil(cid)) {
        const YouTubeMediaData = await bot.youtube.getMedia(cid);
        let songAuthor = null;
        let songTitle = null;

        try {
          const fullTitle = get(YouTubeMediaData, "snippet.title");

          songAuthor = fullTitle.split(" - ")[0].trim();
          songTitle = fullTitle.split(" - ")[1].trim();
        }
        catch (err) {
          //console.warn(err);
          //return;
        }

        const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, cid);
        //const isOverplayed = await bot.utils.isSongOverPlayed(songAuthor, songTitle, cid);

        if (isNil(songHistory)) {
          this.reply(lang.plays.neverPlayed, { which: lang.plays.specified });
          return true;
        } else {
          if (!songHistory.maybe) {
            let playsCount = 0;
            const roomHistory = await bot.getRoomHistory();
            const notSongHistory = roomHistory.shift();

            for (var e = 0; e < notSongHistory.length; e++) {
              if (notSongHistory[e].media.sourceID == map(songHistory, "media.sourceID")[0]) {
                playsCount++;
              }
            }

            if (playsCount < 1) {
              this.reply(lang.plays.lastPlaySkippedWas, {
                which: lang.plays.specified,
                time: bot.moment(map(songHistory, "playedAt")[0]).fromNow(),
              });
              //if (isOverplayed) { bot.chat("Song Is Overplayed!"); }

              return true;
            }

            this.reply(lang.plays.lastPlayWas, {
              which: lang.plays.specified,
              time: bot.moment(map(songHistory, "playedAt")[0]).fromNow(),
              count: playsCount,
            });
            //if (isOverplayed) { bot.chat("Song Is Overplayed!"); }

            return true;
          } else {
            if (songHistory.media.sourceType === "youtube") {
              this.reply(lang.plays.maybeLastPlayWas, {
                which: lang.plays.specified,
                cid: map(songHistory, "media.sourceID")[0],
                time: bot.moment(map(songHistory, "playedAt")[0]).fromNow(),
              });
              //if (isOverplayed) { bot.chat("Song Is Overplayed!"); }

              return true;
            }
          }
        }
      } else if (link.includes("soundcloud.com")) {
        const soundcloudMediaRaw = await bot.soundcloud.resolve(link);
        const soundcloudMedia = JSON.parse(soundcloudMediaRaw);

        if (isNil(soundcloudMedia)) return false;

        if (isObject(soundcloudMedia) && has(soundcloudMedia, "id")) {
          const SoundCloudMediaData = await bot.soundcloud.getTrack(soundcloudMedia.id);

          if (!isNil(SoundCloudMediaData)) {
            const fullTitle = SoundCloudMediaData.title;
            let songAuthor = null;
            let songTitle = null;

            try {
              songAuthor = fullTitle.split(" - ")[0].trim();
              songTitle = fullTitle.split(" - ")[1].trim();
            }
            catch (err) {
              //err
            }

            const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, cid);
            //const isOverplayed = await bot.utils.isSongOverPlayed(songAuthor, songTitle, cid);

            if (isNil(songHistory)) {
              this.reply(lang.plays.neverPlayed, { which: lang.plays.specified });
              return true;
            } else {
              if (!songHistory.maybe) {
                let playsCount = 0;
                const roomHistory = await bot.getRoomHistory();
                const notSongHistory = roomHistory.shift();

                for (var o = 0; o < notSongHistory.length; o++) {
                  if (notSongHistory[o].media.sourceID == map(songHistory, "media.sourceID")[0]) {
                    playsCount++;
                  }
                }

                if (playsCount < 1) {
                  this.reply(lang.plays.lastPlaySkippedWas, {
                    which: lang.plays.specified,
                    time: bot.moment(map(songHistory, "playedAt")[0]).fromNow(),
                  });
                  //if (isOverplayed) { bot.chat("Song Is Overplayed!"); }

                  return true;
                }

                this.reply(lang.plays.lastPlayWas, {
                  which: lang.plays.specified,
                  time: bot.moment(map(songHistory, "playedAt")[0]).fromNow(),
                  count: playsCount,
                });
                //if (isOverplayed) { bot.chat("Song Is Overplayed!"); }

                return true;
              } else {
                if (songHistory.media.sourceType === "youtube") {
                  this.reply(lang.plays.maybeLastPlayWas, {
                    which: lang.plays.specified,
                    cid: map(songHistory, "media.sourceID")[0],
                    time: bot.moment(map(songHistory, "playedAt")[0]).fromNow(),
                  });
                  //if (isOverplayed) { bot.chat("Song Is Overplayed!"); }

                  return true;
                }
              }
            }
          }
        }

        return false;
      }

      this.reply(lang.plays.invalidLink, {});
      return false;
    },
  });
};
