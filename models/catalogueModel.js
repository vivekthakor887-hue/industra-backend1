const mongoose = require("mongoose");

const catalogueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    pdf: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Catalogue", catalogueSchema);
