const mongoose = require("mongoose");

const sectionItemSchema = new mongoose.Schema({
    section_key: { type: String, required: true },
    section_name: { type: String },
    updated_section_name: { type: String },
    is_visible: { type: Boolean, default: true },
    is_visible_footer: { type: Boolean, default: true },
    display_order: { type: Number, default: 0 },
    
});

const sectionSchema = new mongoose.Schema({
    sectionType: { type: String, required: true, lowercase: true, trim: true },
    items: [sectionItemSchema],
    createdAt: { type: Date, default: Date.now },
});

const SectionSetting = mongoose.model("SectionSetting", sectionSchema);

module.exports = SectionSetting;

