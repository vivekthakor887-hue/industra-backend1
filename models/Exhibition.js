// models/exhibitionModel.js
const mongoose = require("mongoose");

const exhibitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String },
    date: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exhibition", exhibitionSchema);
