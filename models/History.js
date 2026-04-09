const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    year: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);
