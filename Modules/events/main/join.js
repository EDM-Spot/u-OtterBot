const { isNil, isNaN } = require("lodash");
const moment = require("moment");

module.exports = function Event(bot, platform) {
  const event = {
    name: "join",
    platform,
    run: async (data) => {
      console.log(data);
      if (isNil(data.username) || data.id === await bot.getSelf()._id) return;
      
      const position = parseInt(await bot.redis.findDisconnection(data.id), 10);

      //await bot.db.models.users.findOrCreate({
        //where: { id: data.id }, defaults: { id: data.id, username: data.username },
      //});
      
      //try {
        //await bot.db.models.users.update(
          //{ username: data.username, last_seen: moment() },
          //{ where: { id: data.id }, defaults: { id: data.id }}
        //);
      //}
      //catch (err) {
        //console.warn(err);
        //console.log(data);
      //}
      
      if (isNil(position) || isNaN(position))	return;

      const waitlist = await bot.getWaitlist();
      
      if (waitlist.length <= position && !waitlist.contains(data.id)) {
        bot.chat(`@${data.username} ` + bot.lang.commands.dc.waitlistSmaller);
        bot.queue.add(data, waitlist.length + 1);
      } else if (waitlist.contains(data.id) && waitlist.positionOf(data.id) <= position) {
        bot.chat(`@${data.username} ` + bot.lang.commands.dc.sameOrLower);
      } else {
        bot.queue.add(data, position);
        bot.chat(`@${data.username} ` + bot.utils.replace(bot.lang.commands.dc.placeBack, {
          position: position,
          when: waitlist.length === 50 ?
            bot.lang.commands.dc.whenPossible : bot.lang.commands.dc.now,
        }));
      }
      
      await bot.redis.removeDisconnection(data.id);
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