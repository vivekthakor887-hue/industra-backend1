const mongoose = require("mongoose");

const HeroSectionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    media: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeroSection", HeroSectionSchema);
