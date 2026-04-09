const mongoose = require("mongoose");

const pageSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      unique: true,     
      lowercase: true,   
      trim: true
    },

    title: {
      type: String,
      trim: true
    },
    
    label: {
      type: String,
      trim: true
    },
    image:{
      type: String,
      trim: true
    },
    pageBgBanner: {   
      type: String,
      trim: true,
      default: ""      
    },
    description: {
      type: String,
      trim: true
  }
},
  { timestamps: true }
);

module.exports = mongoose.model("PageSection", pageSectionSchema);
