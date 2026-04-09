const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  badge: { type: String, required: true },
  shortDescription: { type: String },
  description: { type: String },
  features: String,
  labels: [String],
  image: { type: String },
  imagesecond: { type: String },
  video: { type: String },
  experience: { type: Number, default: 0 },
  
});

module.exports = mongoose.model("About", aboutSchema);
