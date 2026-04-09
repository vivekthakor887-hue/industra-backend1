const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },

    name: { type: String, trim: true },
    about: { type: String, trim: true },
    images: [{ type: String }],
    sectionImage: { type: String },


    // === ITEMS (ADD MORE) ===
    items: [
      {
        iconName: { type: String, trim: true },
        title: { type: String, trim: true },
        label: { type: String, trim: true },
      },
    ],

  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
