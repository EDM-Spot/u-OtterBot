module.exports = async function Model(bot, mongoose) {

  const { Schema } = mongoose;
  const { Types } = mongoose.Schema;

  const bannedSchema = new Schema({
    moderator: { type: Types.ObjectId, ref: "User", index: true },
    duration: { type: Number, required: true },
    expiresAt: { type: Date, required: true, index: true },
    reason: { type: String, default: "" },
  });

  const Users = bot.db.model("users", {
    username: {
      type: String,
      minlength: [3, "Usernames have to be at least 3 characters long."],
      maxlength: [32, "Usernames can be at most 32 characters long."],
      match: [/^[^\s]+$/, "Usernames can't contain spaces."],
      required: true,
      unique: true,
      index: true,
      set: (name) => name.normalize("NFKC"),
    },
    language: {
      type: String, min: 2, max: 2, default: "en",
    },
    roles: [{ type: String, ref: "AclRole" }],
    // Deprecated, `roles` should be used instead.
    // However some clients (*cough* u-wave-web *cough*) haven't updated to the
    // ACL system so they need this key to exist.
    role: { type: Number, min: 0, default: 0 },
    avatar: {
      type: String, min: 0, max: 256, default: "",
    },
    slug: {
      type: String,
      unique: true,
      required: [true, "Usernames must not consist of punctuation only."],
      index: true,
    },
    discordId: {
      type: String, unique: true, default: "", index: true,
    },
    activePlaylist: {
      type: Types.ObjectId,
      ref: "Playlist",
    },
    level: {
      type: Number, min: 0, max: 9001, default: 0,
    },
    exp: {
      type: Number, min: 0, max: 2147483647, default: 0,
    },
    points: {
      type: Number, min: 0, max: 2147483647, default: 0,
    },
    expDispenseCycles: {
      type: Number, min: 0, max: 72, default: 0,
    },
    lastSeenAt: { type: Date, default: Date.now },
    lastExpDispense: { type: Date, default: Date.now },
    exiled: { type: Boolean, default: false },
    banned: bannedSchema,
    pendingActivation: { type: String, required: false },
  });

  bot.db.models.users = Users;

  return Users;
};