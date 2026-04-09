const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    quote: { type: String, required: true },
    location: { type: String },
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", TestimonialSchema);
