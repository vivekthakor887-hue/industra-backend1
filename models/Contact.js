const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    logo: { type: String },
    darkLogo: { type: String },
    favicon: { type: String },
    phones: [{ type: String }],
    socialLinks: {
      facebook: String,
      instagram: String,
      x: String,
      linkedin: String,
      youtube: String,
    },
    primaryColor: { type: String, default: "#000000" },
    secondaryColor: { type: String, default: "#ffffff" },
    accentColor: { type: String, default: "#ff0000" },

    generalBorderRadius: { type: Number, default: 0 },
    buttonRadius: { type: Number, default: 0 },

    badgeLayout: { type: Boolean, default: false },

    generalFont: { type: String, default: "default" },
    headerFont: { type: String, default: "default" },

    workingtime: [{ type: String }],
    aboutcompany: { type: String },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
