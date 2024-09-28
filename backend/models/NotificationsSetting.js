const mongoose = require("mongoose");

const UserNotificationsSetting = new mongoose.Schema({
  preferredPlan: { type: Number, enum: [1, 2, 3] },
  frequency: { type: String, enum: ["daily", "weekly", "monthly"] },
  rows: Number,
  sendLinks: Boolean,
  websites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Website" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserNotificationsSetting", UserNotificationsSetting);
