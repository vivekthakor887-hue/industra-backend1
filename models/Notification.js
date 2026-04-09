const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      trim: true
    },
     isRead: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
  