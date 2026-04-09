const mongoose = require("mongoose");

const HowItWorkSchema = new mongoose.Schema(
  {
    items: [
      {
        iconName: { type: String, trim: true },
        title: { type: String, trim: true },
        shortDescription: { type: String, trim: true }
      }
    ],

    image: {
      type: String,
      default: ""
    },

    backgroundImage: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HowItWork", HowItWorkSchema);
