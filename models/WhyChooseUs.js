const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  title: String,
  badge: String,
  description: String,   
  features: String,
  labels: [String],
  image: String
}, { timestamps: true });

module.exports = mongoose.model("WhyChooseUs", sectionSchema);
