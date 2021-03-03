const { isNil } = require("lodash");

module.exports = function Util(bot) {
  const util = {
    name: "getSongHistory",
    function: async (songAuthor, songTitle, sourceID) => {
      if (isNil(sourceID)) return;

      const songHistory = await bot.getRoomHistory();
      songHistory.shift();

      if (isNil(songAuthor) || isNil(songTitle)) {
        songAuthor = "undefined";
        songTitle = "undefined";
      }

      if (!isNil(songHistory)) {
        for (let i = 0; i < songHistory.length; i++) {
          const playedMinutes = bot.moment().diff(bot.moment(songHistory[i].playedAt), "minutes");

          if (!isNil(songHistory[i].media.title)) {
            const currentAuthor = songAuthor.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
            const savedAuthor = songHistory[i].media.artist.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();

            const currentTitle = songTitle.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
            const savedTitle = songHistory[i].media.title.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();

            if (playedMinutes <= 360) {
              if (songHistory[i].media.sourceID === sourceID) {
                // Song Played | Same ID
                return { songHistory: songHistory[i], maybe: false, skip: true };
              }

              if ((savedTitle === currentTitle) && (savedAuthor === currentAuthor) && (songHistory[i].media.sourceID !== sourceID)) {
                // Same Song | Diff sourceID | Diff Remix/Channel
                return { songHistory: songHistory[i], maybe: false, skip: true };
              }

              if ((savedTitle === currentTitle) && (savedAuthor !== currentAuthor) && (songHistory[i].media.sourceID !== sourceID)) {
                // Same Song Name/Maybe diff Author
                return { songHistory: songHistory[i], maybe: true, skip: true };
              }
            } else {
              if (songHistory[i].media.sourceID === sourceID) {
                // Song Played | Same ID
                return { songHistory: songHistory[i], maybe: false, skip: false };
              }

              if ((savedTitle === currentTitle) && (savedAuthor === currentAuthor) && (songHistory[i].media.sourceID !== sourceID)) {
                // Same Song | Diff sourceID | Diff Remix/Channel
                return { songHistory: songHistory[i], maybe: false, skip: false };
              }
            }
          }
        }
      }

      return undefined;
    },
  };

  bot.utils.register(util);
};