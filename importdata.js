const mongoose = require("mongoose");
require("./config/db");
const fs = require("fs");
const path = require("path");

// ================= MODELS =================
const MODELS = [
  require("./models/About"),
  require("./models/AdminPasswordResetToken"),
  require("./models/AdminSignup"),
  require("./models/Blog"),
  require("./models/catalogueModel"),
  require("./models/Category"),
  require("./models/Contact"),
  require("./models/Exhibition"),
  require("./models/Faq"),
  require("./models/Gallery"),
  require("./models/GetInTouch"),
  require("./models/HeroSection"),
  require("./models/Herostat"),
  require("./models/History"),
  require("./models/HowItWork"),
  require("./models/Newsletter"),
  require("./models/Notification"),
  require("./models/PageSection"),
  require("./models/Project"),
  require("./models/SectionSetting"),
  require("./models/Seo"),
  require("./models/Service"),
  require("./models/Testimonial"),
  require("./models/WhyChooseUs"),
];

// ================= FILES =================
const FILES = [
  "./database/abouts.json",
  "./database/adminpasswordresettokens.json",
  "./database/admins.json",
  "./database/blogs.json",
  "./database/catalogues.json",
  "./database/categories.json",
  "./database/contacts.json",
  "./database/exhibitions.json",
  "./database/faqs.json",
  "./database/galleries.json",
  "./database/getintouches.json",
  "./database/herosections.json",
  "./database/herostats.json",
  "./database/histories.json",
  "./database/howitworks.json",
  "./database/newsletters.json",
  "./database/notifications.json",
  "./database/pagesections.json",
  "./database/projects.json",
  "./database/sectionsettings.json",
  "./database/seos.json",
  "./database/services.json",
  "./database/testimonials.json",
  "./database/whychooseus.json",  
];

// ================= CLEAN MONGO EXPORT =================
function cleanValue(value) {
  if (value && typeof value === "object") {
    if (value.$oid) return value.$oid;
    if (value.$date) return value.$date;
  }
  return value;
}

// ================= IMPORT FUNCTION =================
async function insertAll() {
  try {
    for (let i = 0; i < MODELS.length; i++) {
      const Model = MODELS[i];
      const filePath = path.join(__dirname, FILES[i]);

      console.log(` Importing ${FILES[i]} → ${Model.collection.name}`);

      //  Read JSON
      let jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      //  Clean $oid / $date
      jsonData = jsonData.map(item => {
        const newItem = {};
        for (let key in item) {
          newItem[key] = cleanValue(item[key]);
        }
        return newItem;
      });

      //  Convert ObjectId & Dates (SAFE)
      const preparedData = jsonData.map(item => {
        const newItem = { ...item };

        Object.keys(newItem).forEach(key => {

          // _id + foreign keys
          if (
            (key === "_id" || key.toLowerCase().endsWith("id")) &&
            typeof newItem[key] === "string" &&
            mongoose.Types.ObjectId.isValid(newItem[key])
          ) {
            newItem[key] = new mongoose.Types.ObjectId(newItem[key]);
          }

          // Dates
          if (
            key.toLowerCase().includes("date") ||
            key === "createdAt" ||
            key === "updatedAt"
          ) {
            if (newItem[key]) {
              newItem[key] = new Date(newItem[key]);
            }
          }
        });

        return newItem;
      });

      //CLEAR COLLECTION (REAL RESTORE)
      await Model.deleteMany({});

      // INSERT (REAL IMPORT)
      const result = await Model.insertMany(preparedData, {
        ordered: false,
        runValidators: false,
      });

      console.log(`Imported ${result.length} records`);
    }

    console.log(" ALL COLLECTIONS IMPORTED SUCCESSFULLY!");
    process.exit(0);

  } catch (err) {
    console.error(" IMPORT FAILED:", err);
    process.exit(1);
  }
}

insertAll();