const About = require("../models/About");
const Blog = require('../models/Blog');
const History = require('../models/History');
const Exhibition = require('../models/Exhibition');
const Category = require('../models/Category');
const Catalogue = require('../models/catalogueModel');
const Newsletter = require('../models/Newsletter');
const Contact = require('../models/Contact');
const Service = require('../models/Service');
const bcrypt = require("bcrypt");
const Admin = require("../models/AdminSignup");
const Faq = require('../models/Faq');
const Testimonial = require('../models/Testimonial');
const Notification = require("../models/Notification");
const GetInTouch = require('../models/GetInTouch');
const HeroStat = require("../models/Herostat");
const HowItWork = require("../models/HowItWork");
const Gallery = require("../models/Gallery");
const WhyChooseUs = require("../models/WhyChooseUs");
const HeroSection = require("../models/HeroSection");
const EcoCategory = require('../models/Category');
const Project = require('../models/Project');
const SectionSetting = require("../models/SectionSetting");
const PageSection = require("../models/PageSection");
const Seo = require("../models/Seo");
const AdminPasswordResetToken = require("../models/AdminPasswordResetToken");
const ApikeySetting = require("../models/ApikeySetting");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const getTransporter = require("../helper/EmailHelper");
//========================================== file mangement ==========================================//
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");



//========================================== Contacts ==========================================//

//============================
// Get Contact
//============================
module.exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne();
    const section = await PageSection.findOne({ type: "contact" }).lean();
    const admin = await Admin.findOne();
    res.render("Pages/Contact", { contact, section, admin });
  } catch (err) {
    console.error("Error fetching contact:", err);
    res.render("Contact", { contact: null });
  }
};

//============================
//  Save or Update contact 
//============================
module.exports.saveContact = async (req, res) => {
  try {
    let { companyName, email, address, phones, facebook, instagram, x, linkedin, youtube, workingtime,
      aboutcompany,
      primaryColor,
      secondaryColor,
      accentColor,
      generalBorderRadius,
      buttonRadius,
      badgeLayout,
      generalFont,
      headerFont
    } = req.body;

    if (typeof phones === "string") phones = [phones];

    if (typeof workingtime === "string") workingtime = [workingtime];
    const badgeLayoutValue = badgeLayout === "on";

    let logoPath;
    let faviconPath;
    let darkLogoPath;

    // =====================
    // LOGO
    // =====================
    if (req.files?.image?.length > 0) {
      logoPath = "/uploads/logo/" + req.files.image[0].filename;
    }

    // =====================
    // DARK LOGO
    // =====================
    if (req.files?.darkLogo?.length > 0) {
      darkLogoPath = "/uploads/logo/" + req.files.darkLogo[0].filename;
    }
    // =====================
    // FAVICON
    // =====================
    if (req.files?.favicon?.length > 0) {
      faviconPath = "/uploads/logo/" + req.files.favicon[0].filename;
    }

    let contact = await Contact.findOne();

    if (contact) {
      // --- delete old logo ---
      if (logoPath && contact.logo) {
        const oldLogo = path.join(process.cwd(), contact.logo);
        if (fs.existsSync(oldLogo)) fs.unlinkSync(oldLogo);
      }

      if (darkLogoPath && contact.darkLogo) {
        const oldDarkLogo = path.join(process.cwd(), contact.darkLogo);
        if (fs.existsSync(oldDarkLogo)) fs.unlinkSync(oldDarkLogo);
      }
      // --- delete old favicon ---
      if (faviconPath && contact.favicon) {
        const oldFavicon = path.join(process.cwd(), contact.favicon);
        if (fs.existsSync(oldFavicon)) fs.unlinkSync(oldFavicon);
      }

      contact.companyName = companyName;
      contact.email = email;
      contact.address = address;
      contact.phones = phones;
      contact.socialLinks = { facebook, instagram, x, linkedin, youtube };
      contact.workingtime = workingtime;
      contact.aboutcompany = aboutcompany;
      contact.primaryColor = primaryColor;
      contact.secondaryColor = secondaryColor;
      contact.accentColor = accentColor;
      contact.generalBorderRadius = generalBorderRadius;
      contact.buttonRadius = buttonRadius;
      contact.badgeLayout = badgeLayoutValue;
      contact.generalFont = generalFont;
      contact.headerFont = headerFont;
      if (logoPath) contact.logo = logoPath;
      if (darkLogoPath) contact.darkLogo = darkLogoPath;
      if (faviconPath) contact.favicon = faviconPath;

      await contact.save();
    } else {
      contact = await Contact.create({
        companyName,
        email,
        address,
        logo: logoPath,
        favicon: faviconPath,
        darkLogo: darkLogoPath,
        phones,
        socialLinks: { facebook, instagram, x, linkedin, youtube },
        workingtime,
        aboutcompany,
        primaryColor,
        secondaryColor,
        accentColor,
        generalBorderRadius,
        buttonRadius,
        badgeLayout: badgeLayoutValue,
        generalFont,
        headerFont
      });
    }

    res.json({ success: true, message: "Contact details saved successfully!", contact });
  } catch (err) {
    console.error("Contact save error:", err);
    res.json({ success: false, message: "Failed to save contact details!" });
  }
};



//========================================== Login Apis ==========================================//


//============================
// Get login page
//============================
module.exports.loginpage = async (req, res) => {
  if (req.session.adminId) {
    return res.redirect("/");
  }

  const setting = await Contact.findOne(
    {},
    { logo: 1, darkLogo: 1, favicon: 1 } //  darkLogo add
  ).lean();

  res.render("Pages/Login", {
    lightLogo: setting?.logo,
    darkLogo: setting?.darkLogo,
    favicon: setting?.favicon
  });
};


//============================
// Signup 
//============================
module.exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.json({ success: false, message: "All fields are required" });

    const existing = await Admin.findOne({ email });
    if (existing)
      return res.json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ name, email, password: hashed });
    await admin.save();

    res.json({ success: true, message: "Admin registered successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//============================
//  Login
//============================
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if fields are empty
    if (!email || !password) {
      return res.render('Pages/Login', { error: "All fields are required", email });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.render('Pages/Login', { error: "Invalid email or password", email });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.render('Pages/Login', { error: "Invalid email or password", email });
    }

    // --- Save session ---
    req.session.adminId = admin._id;
    req.session.adminEmail = admin.email;

    // --- Redirect to dashboard ---
    res.redirect('/');
  } catch (err) {
    console.error("Login Error:", err);
    res.render('Login', { error: "Server error, please try again later" });
  }
};

//============================
// Logout
//============================
module.exports.logout = (req, res) => {
  req.session.destroy((err) => {

    res.redirect('/loginpage')
  });
};

//============================
//  Protect Routes
//============================
module.exports.requireLogin = (req, res, next) => {
  if (!req.session.adminId) return res.redirect("/loginpage");
  next();
};



//========================================== Dashboard ==========================================//
//============================
// Get Dashboard
//============================
module.exports.getDashboard = async (req, res) => {
  try {
    const [
      categoryCount, projectCount, newsletterCount, catalogueCount,
      blogCount, historyCount, exhibitionCount, notificationcount, testimonialCount, statscount, faqCount, herosectionCount, inquiryStats
    ] = await Promise.all([
      Category.countDocuments(),
      Project.countDocuments(),
      Newsletter.countDocuments(),
      Catalogue.countDocuments(),
      Blog.countDocuments(),
      History.countDocuments(),
      Exhibition.countDocuments(),
      Notification.countDocuments(),
      Testimonial.countDocuments(),
      HeroStat.countDocuments(),
      Faq.countDocuments(),
      HeroSection.countDocuments(),
      GetInTouch.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            total: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])


    ]);

    const inquiryDates = inquiryStats.map(i => i._id);
    const inquiryCounts = inquiryStats.map(i => i.total);

    // Maximum for progress bar calculation
    const maxCount = Math.max(categoryCount, projectCount, newsletterCount, catalogueCount, blogCount, historyCount, exhibitionCount, notificationcount, testimonialCount, statscount, faqCount, herosectionCount, 1);

    const admin = await Admin.findOne();
    res.render("Pages/Dashboard", {
      categoryCount, projectCount, newsletterCount, catalogueCount, blogCount, historyCount, exhibitionCount, notificationcount, testimonialCount, statscount, faqCount, herosectionCount,
      maxCount, admin,
      inquiryDates,
      inquiryCounts,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.render("Pages/Dashboard", {
      categoryCount: 0, projectCount: 0, newsletterCount: 0, catalogueCount: 0,
      blogCount: 0, historyCount: 0, exhibitionCount: 0, notificationcount: 0, testimonialCount: 0, statscount: 0, faqCount: 0, herosectionCount: 0,
      maxCount: 1
    });
  }
};




//========================================== About ==========================================//



//============================
// Get All Abouts
//============================
module.exports.getAllAbouts = async (req, res) => {
  try {
    const abouts = await About.find().sort({ _id: -1 });

    res.json({ data: abouts });
  } catch (err) {
    console.error("Error fetching Abouts:", err);
    res.status(500).json({ data: [] });
  }
};

//============================
//  Add or Edit About
//============================
module.exports.saveAbout = async (req, res) => {
  try {


    const { id, title, badge, shortDescription, description, features, experience } = req.body;

    // ---------- LABELS FIX ----------
    let labels = [];
    if (req.body.labels) {
      // single label case
      labels = Array.isArray(req.body.labels)
        ? req.body.labels
        : [req.body.labels];
    }

    let imagePath = null;
    let imagesecondPath = null;
    let videoPath = null;

    if (req.files?.image) {
      imagePath = "/uploads/about/" + req.files.image[0].filename;
    }

    if (req.files?.imagesecond) {
      imagesecondPath = "/uploads/about/" + req.files.imagesecond[0].filename;
    }

    if (req.files?.video) {
      videoPath = "/uploads/about/" + req.files.video[0].filename;
    }

    // =========================
    // UPDATE
    // =========================
    if (id) {
      const about = await About.findById(id);
      if (!about) {
        return res.json({ success: false, message: "About not found" });
      }

      // delete old files only if new uploaded
      if (imagePath && about.image) {
        const oldPath = path.join(process.cwd(), about.image.replace(/^\//, ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      if (imagesecondPath && about.imagesecond) {
        const oldPath2 = path.join(
          process.cwd(),
          about.imagesecond.replace(/^\//, "")
        );
        if (fs.existsSync(oldPath2)) fs.unlinkSync(oldPath2);
      }

      if (videoPath && about.video) {
        const oldPath3 = path.join(
          process.cwd(),
          about.video.replace(/^\//, "")
        );
        if (fs.existsSync(oldPath3)) fs.unlinkSync(oldPath3);
      }

      // -------- SAVE DATA --------
      about.title = title;
      about.description = description;
      about.features = features || "";
      about.labels = labels;
      about.badge = badge;
      about.shortDescription = shortDescription;
      about.experience = experience || 0;

      if (imagePath) about.image = imagePath;
      if (imagesecondPath) about.imagesecond = imagesecondPath;
      if (videoPath) about.video = videoPath;

      await about.save();
      return res.json({
        success: true,
        message: "About updated successfully!"
      });
    }

    // =========================
    // CREATE
    // =========================
    const newAbout = new About({
      title,
      description,
      features: features || "",
      labels,
      image: imagePath,
      imagesecond: imagesecondPath,
      video: videoPath,
      badge,
      shortDescription,
      experience: experience || 0,
    });

    await newAbout.save();

    res.json({
      success: true,
      message: "About added successfully!"
    });

  } catch (err) {
    console.error("Error saving About:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

//============================
//  Delete About
//============================
module.exports.deleteAbout = async (req, res) => {
  try {
    const about = await About.findById(req.params.id);
    if (!about) return res.json({ success: false, message: "About not found" });

    if (about.image) {
      const filePath = path.join(process.cwd(), about.image.replace(/^\//, ""));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await about.deleteOne();
    res.json({ success: true, message: "About deleted successfully!" });
  } catch (err) {
    console.error("Error deleting About:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//============================
//  Render About Page
//============================
module.exports.renderAboutPage = async (req, res) => {
  const section = await PageSection.findOne({ type: "about" }).lean();
  const admin = await Admin.findOne();
  res.render("Pages/About", { section, admin });
};

//========================================== Blog ==========================================//


//============================
// Add Blog
//============================
module.exports.addBlog = async (req, res) => {
  try {
    const { id, title, description, date, category } = req.body;

    if (!title) {
      return res.json({ success: false, message: "Title is required!" });
    }

    let imagePath = null;
    let thumbnailPath = null;

    if (req.file) {
      imagePath = "/uploads/blog/" + req.file.filename;
      thumbnailPath = req.thumbnailPath || null;
    }

    let blogDoc;
    if (id) {
      // -------- UPDATE --------
      blogDoc = await Blog.findById(id);
      if (!blogDoc)
        return res.json({ success: false, message: "Blog not found!" });

      // delete old image & thumbnail if new uploaded
      if (req.file && blogDoc.image) {
        const oldPath = path.join(__dirname, "..", blogDoc.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

        if (blogDoc.thumbnail) {
          const oldThumb = path.join(__dirname, "..", blogDoc.thumbnail);
          if (fs.existsSync(oldThumb)) fs.unlinkSync(oldThumb);
        }
      }

      blogDoc.title = title;
      blogDoc.description = description;
      blogDoc.date = date || blogDoc.date;
      blogDoc.category = category;

      if (imagePath) blogDoc.image = imagePath;
      if (thumbnailPath) blogDoc.thumbnail = thumbnailPath; // ✅ FIX

      await blogDoc.save();

      return res.json({
        success: true,
        message: "Blog updated successfully!",
      });
    } else {
      // -------- CREATE --------
      const newBlog = new Blog({
        title,
        description,
        category,
        image: imagePath,
        thumbnail: thumbnailPath, // ✅ FIX
        date: date || new Date(),
      });

      await newBlog.save();

      return res.json({
        success: true,
        message: "Blog added successfully!",
      });
    }
  } catch (err) {
    console.error("addBlog error:", err);
    res.json({ success: false, message: "Something went wrong!" });
  }
};


//============================
// Get All Blog Data 
//============================
module.exports.getBlogJson = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("category", "title")
      .sort({ createdAt: -1 });
    res.json({ data: blogs });
  } catch (err) {
    console.error(err);
    res.json({ data: [] });
  }
};

//============================
// Delete Blog
//============================
module.exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) return res.json({ success: false, message: "Blog not found!" });

    // delete image file
    if (blog.image) {
      const filePath = path.join(__dirname, "..", blog.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    //  delete thumbnail file (ADDED)
    if (blog.thumbnail) {
      const thumbPath = path.join(__dirname, "..", blog.thumbnail);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }
    await Blog.findByIdAndDelete(id);
    res.json({ success: true, message: "Blog deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to delete blog!" });
  }
};

//============================
// Get blog Page
//============================
module.exports.renderBlogPage = async (req, res) => {
  const section = await PageSection.findOne({ type: "blog" }).lean();
  const admin = await Admin.findOne();
  res.render("Pages/Blog", { section, admin });
};



//========================================== Exhibition ==========================================//


//============================
// Get All Exhibition
//============================
module.exports.getAllExhibition = async (req, res) => {
  const section = await PageSection.findOne({ type: "exhibition" }).lean();
  const admin = await Admin.findOne();
  res.render('Pages/Exhibition', { section, admin })
}

//============================
//  Get Exhibition Json
//============================
module.exports.getExhibitionJson = async (req, res) => {
  try {
    const exhibitions = await Exhibition.find().sort({ createdAt: -1 });
    res.json({ data: exhibitions });
  } catch (err) {
    console.error("Error fetching exhibitions:", err);
    res.json({ data: [] });
  }
};

//============================
// Add / Update exhibition
//============================
module.exports.saveExhibition = async (req, res) => {
  try {
    const { id, title, location, date } = req.body;
    let imagePath = null;

    if (req.file) {
      imagePath = "/uploads/exhibition/" + req.file.filename;
    }

    // --- UPDATE ---
    if (id) {
      const exhibition = await Exhibition.findById(id);
      if (!exhibition)
        return res.json({ success: false, message: "Exhibition not found" });

      // --- Delete old image if new uploaded ---
      if (req.file && exhibition.image) {
        const oldPath = path.join(__dirname, "..", exhibition.image);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) console.error("Failed to delete old image:", err);
          });
        }
      }

      exhibition.title = title;
      exhibition.location = location;
      exhibition.date = date;
      if (imagePath) exhibition.image = imagePath;

      await exhibition.save();
      return res.json({ success: true, message: "Exhibition updated successfully!" });
    }

    // --- CREATE ---
    const newExhibition = new Exhibition({
      title,
      location,
      date,
      image: imagePath,
    });
    await newExhibition.save();

    res.json({ success: true, message: "Exhibition added successfully!" });
  } catch (err) {
    console.error("Error saving exhibition:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//============================
//  Delete exhibition
//============================
module.exports.deleteExhibition = async (req, res) => {
  try {
    const exhibition = await Exhibition.findById(req.params.id);
    if (!exhibition)
      return res.json({ success: false, message: "Exhibition not found" });

    // Delete image file if exists
    if (exhibition.image) {
      const filePath = path.join(__dirname, "..", exhibition.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await exhibition.deleteOne();
    res.json({ success: true, message: "Exhibition deleted successfully!" });
  } catch (err) {
    console.error("Error deleting exhibition:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//========================================== Service Page ==========================================//

//============================
// Get All Service
//============================
module.exports.getAllService = async (req, res) => {
  const section = await PageSection.findOne({ type: "service" }).lean();
  const admin = await Admin.findOne();
  res.render('Pages/Service', { section, admin })
}

//============================
// Get Service Json
//============================
module.exports.getServiceJson = async (req, res) => {
  try {
    const draw = req.query.draw || req.body.draw;
    const start = Number(req.query.start || req.body.start || 0);
    const length = Number(req.query.length || req.body.length || 10);

    //  DataTables search (your required way)
    const search = req.query["search[value]"]?.trim() || "";

    //  Only title search
    const searchQuery = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    // Total records (without search)
    const total = await Service.countDocuments();

    // Total records after search
    const filteredTotal = await Service.countDocuments(searchQuery);

    // Fetch data
    const services = await Service.find(searchQuery)
      .skip(start)
      .limit(length);

    res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: filteredTotal,
      data: services
    });

  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
};


//============================
// Add / Update Product
//============================
module.exports.saveService = async (req, res) => {
  try {
    const { id, title, description, features, } = req.body;

    let labels = [];
    if (req.body.labels) {
      labels = Array.isArray(req.body.labels)
        ? req.body.labels
        : [req.body.labels];
    }

    let imagePath = null;

    // File upload
    if (req.file) {
      imagePath = "/uploads/service/" + req.file.filename;
    }

    // --- Update ---
    if (id) {
      const service = await Service.findById(id);
      if (!service)
        return res.json({ success: false, message: "service not found!" });

      // Delete old image if replaced
      if (imagePath && service.image) {
        const oldPath = path.join(__dirname, "..", service.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      service.title = title;
      service.description = description;
      service.features = features || "";
      service.labels = labels;
      if (imagePath) service.image = imagePath;

      await service.save();
      return res.json({ success: true, message: "service updated successfully!" });
    }

    // --- Add new ---
    const newService = new Service({
      title,
      description,
      features: features || "",
      labels,
      image: imagePath,
    });
    await newService.save();

    res.json({ success: true, message: "service added successfully!" });
  } catch (err) {
    console.error("Error saving product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//============================
//  Delete Product
//============================
module.exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service)
      return res.json({ success: false, message: "service not found!" });

    // delete image file
    if (service.image) {
      const filePath = path.join(__dirname, "..", service.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Service.findByIdAndDelete(id);
    res.json({ success: true, message: "Service deleted successfully!" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//========================================== Categories ==========================================//


//============================
//  Get Category List for dropdown
//============================
module.exports.getCategories = async (req, res) => {
  try {
    const cats = await Category.find().select("title").sort({
      title: 1
    });
    res.json({
      success: true,
      data: cats
    });
  } catch (err) {
    console.error("❌ Error fetching categories:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories."
    });
  }
};

//========================================== Catalogues ==========================================//


//============================
// Get All Catalogues
//============================
module.exports.getAllCatalogues = async (req, res) => {
  const section = await PageSection.findOne({ type: "catalog" }).lean();
  const admin = await Admin.findOne();
  res.render('Pages/Catalogues', { section, admin })
}

//============================
// Get Catalogues Json
//============================
module.exports.getCataloguesJson = async (req, res) => {
  try {
    const data = await Catalogue.find().sort({ createdAt: -1 });
    res.json({ data }); // DataTables expects { data: [...] }
  } catch (err) {
    console.error(" Catalogue data error:", err);
    res.status(500).json({ data: [] });
  }
};

//============================
// Save Catalogue
//============================
module.exports.saveCatalogue = async (req, res) => {
  try {
    const { id, title } = req.body;

    // --- Get new uploaded files (if any) ---
    const image = req.files?.image?.[0]
      ? "/uploads/catalogue/" + req.files.image[0].filename
      : "";
    const pdf = req.files?.pdf?.[0]
      ? "/uploads/catalogue/" + req.files.pdf[0].filename
      : "";

    if (!title) {
      return res.json({ success: false, message: "Title is required" });
    }

    // --- UPDATE EXISTING ---
    if (id) {
      const old = await Catalogue.findById(id);
      if (!old) return res.json({ success: false, message: "Catalogue not found!" });

      // If new files uploaded, optionally remove old ones
      if (image) {
        if (old.image && fs.existsSync("." + old.image)) fs.unlinkSync("." + old.image);
        old.image = image;
      }
      if (pdf) {
        if (old.pdf && fs.existsSync("." + old.pdf)) fs.unlinkSync("." + old.pdf);
        old.pdf = pdf;
      }

      old.title = title;
      await old.save();
      return res.json({ success: true, message: "Catalogue updated successfully" });
    }

    // --- CREATE NEW ---
    await Catalogue.create({ title, image, pdf });
    res.json({ success: true, message: "Catalogue added successfully" });
  } catch (err) {
    console.error(" Catalogue Save Error:", err);
    res.json({ success: false, message: "Something went wrong" });
  }
};

//============================
// DELETE CATALOGUE
//============================
module.exports.deleteCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Catalogue.findByIdAndDelete(id);
    if (!doc) return res.json({ success: false, message: "Catalogue not found!" });

    // Optional: delete associated files
    if (doc.image && fs.existsSync("." + doc.image)) fs.unlinkSync("." + doc.image);
    if (doc.pdf && fs.existsSync("." + doc.pdf)) fs.unlinkSync("." + doc.pdf);

    res.json({ success: true, message: "Catalogue deleted successfully" });
  } catch (err) {
    console.error("❌ Catalogue Delete Error:", err);
    res.json({ success: false, message: "Server error!" });
  }
};

//========================================== Newsletter ==========================================//


//============================
// Get All Newsletter
//============================
module.exports.getAllNewsletter = async (req, res) => {
  const admin = await Admin.findOne();
  res.render('Pages/Newsletter', { admin })
}

//============================
// Get Newsletter json
//============================
module.exports.getNewsletterjson = async (req, res) => {
  try {
    const draw = parseInt(req.query.draw) || 0;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query["search[value]"]?.trim() || "";


    const query = search
      ? { email: { $regex: search, $options: "i" } }
      : {};

    const totalRecords = await Newsletter.countDocuments();
    const filteredRecords = await Newsletter.countDocuments(query);

    const data = await Newsletter.find(query)
      .skip(start)
      .limit(length)
      .sort({ createdAt: -1 });

    res.json({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data,
    });
  } catch (err) {
    console.error("Newsletter list error:", err);
    res.status(500).json({ data: [], recordsTotal: 0, recordsFiltered: 0 });
  }
};

//============================
// Single Delete
//============================
module.exports.deleteNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Newsletter.findByIdAndDelete(id);
    if (!doc)
      return res.json({ success: false, message: "Newsletter not found!" });

    res.json({ success: true, message: "Newsletter deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.json({ success: false, message: "Server error!" });
  }
};

//============================
//  Bulk Delete
//============================
module.exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body; // array of IDs
    if (!ids || !Array.isArray(ids))
      return res.json({ success: false, message: "Invalid request" });

    await Newsletter.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: "Selected newsletters deleted!" });
  } catch (err) {
    console.error(" Bulk delete error:", err);
    res.json({ success: false, message: "Server error!" });
  }
};



//========================================== Faq  ==========================================//

module.exports.getfaqpage = async (req, res) => {
  try {
    // const admin = await Admin.find();
    const section = await PageSection.findOne({ type: "faq" }).lean();
    const admin = await Admin.findOne();
    res.render('Pages/Faq', { section, admin });
  } catch (error) {
    console.log(error);

  }
};

// ==========================
// LOAD JSON (Datatable)
// ==========================
module.exports.getFAQJson = async (req, res) => {
  const data = await Faq.find().sort({ createdAt: -1 });
  res.json({ data });
};
// ==========================
// SAVE FAQ  (ADD / UPDATE)
// ==========================
module.exports.saveFAQ = async (req, res) => {
  try {
    const { id, question, answer } = req.body;

    if (id) {
      await Faq.findByIdAndUpdate(id, { question, answer });
      return res.json({ success: true, message: "FAQ Updated Successfully" });
    }

    await Faq.create({ question, answer });
    return res.json({ success: true, message: "FAQ Added Successfully" });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ==========================
// DELETE FAQ
// ==========================
module.exports.deleteFAQ = async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "FAQ Deleted Successfully" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};





//========================================== Testimonials  ==========================================//
module.exports.gettestinonialpage = async (req, res) => {
  try {
    const section = await PageSection.findOne({ type: "testimonials" }).lean();
    const admin = await Admin.findOne();
    res.render('Pages/Testimonial', { section, admin });
  } catch (error) {
    console.log(error);

  }
}

// ==========================
// DELETE PROJECT
// ==========================
// Get all testimonials (for DataTable)
module.exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ data: testimonials });
  } catch (err) {
    res.json({ data: [] });
  }
};


// ==========================
// DELETE PROJECT
// ==========================
// Add / Update testimonial
module.exports.saveTestimonial = async (req, res) => {
  try {
    const { id, clientName, quote, location, rating } = req.body;

    if (id) {
      const existing = await Testimonial.findById(id);
      if (!existing) return res.status(200).json({ success: false, message: "Testimonial not found" });

      await Testimonial.findByIdAndUpdate(id, { clientName, quote, location, rating });
      return res.status(200).json({ success: true, message: "Testimonial updated successfully" });
    }

    await Testimonial.create({ clientName, quote, location, rating });
    res.json({ success: true, message: "Testimonial added successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ==========================
// DELETE PROJECT
// ==========================
// Delete testimonial
module.exports.deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (err) {
    res.json({ success: false, message: "Delete failed" });
  }
};



//========================================== category ==========================================//

//============================
// Get All Category
//============================
module.exports.getAllCategoryEco = async (req, res) => {
  const section = await PageSection.findOne({ type: "category" }).lean();
  const admin = await Admin.findOne();
  res.render('Pages/Category', { section, admin })
}

//============================
//  Get Category JSON
//============================
module.exports.getCategoryJsonEco = async (req, res) => {
  try {
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;

    const searchValue = req.query["search[value]"]?.trim() || "";

    // Search filter
    const searchQuery = searchValue
      ? { title: { $regex: searchValue, $options: "i" } }
      : {};

    // Total records (without search)
    const totalRecords = await EcoCategory.countDocuments();

    // Records count (with search)
    const filteredRecords = await EcoCategory.countDocuments(searchQuery);

    // Fetch paginated categories
    const categories = await EcoCategory.find(searchQuery)
      .skip(start)
      .limit(length)
      .sort({ createdAt: -1 });

    res.json({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data: categories
    });

  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({
      draw: 0,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: []
    });
  }
};


//============================
// Add / Update Category
//============================
module.exports.saveCategoryEco = async (req, res) => {
  try {

    const { id, title } = req.body;

    // --- Update ---
    if (id) {
      const category = await EcoCategory.findById(id);
      if (!category)
        return res.json({ success: false, message: "Category not found!" });

      category.title = title;
      await category.save();

      return res.json({ success: true, message: "Category updated successfully!" });
    }

    // --- Add New ---
    const newCategory = new EcoCategory({ title });
    await newCategory.save();

    res.json({ success: true, message: "Category added successfully!" });

  } catch (err) {
    console.error("Error saving category:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//============================
//  Delete Category
//============================
module.exports.deleteCategoryEco = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await EcoCategory.findById(id);
    if (!category) return res.json({ success: false, message: "Category not found!" });



    await EcoCategory.findByIdAndDelete(id);
    res.json({ success: true, message: "Category deleted successfully!" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//========================================== Project ==========================================//


//============================
// Get All Product
//============================
module.exports.getAllProject = async (req, res) => {
  const section = await PageSection.findOne({ type: "project" }).lean();
  const admin = await Admin.findOne();
  res.render('Pages/Project', { section, admin })
}

//============================
// Get Project Json
//============================
module.exports.getProjectJson = async (req, res) => {
  try {
    const draw = req.query.draw || req.body.draw;
    const start = Number(req.query.start || req.body.start || 0);
    const length = Number(req.query.length || req.body.length || 10);

    // DataTables search
    const search = req.query["search[value]"]?.trim() || "";

    //  Search only on product title
    const searchQuery = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    // Total records (without filter)
    const total = await Project.countDocuments();

    // Total records after search
    const filteredTotal = await Project.countDocuments(searchQuery);

    // Fetch projects
    const projects = await Project.find(searchQuery)
      .populate("category")
      .skip(start)
      .limit(length)
      .sort({ createdAt: -1 });

    res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: filteredTotal,
      data: projects
    });

  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
};


//============================
// Add / Update Project
//============================
module.exports.saveProject = async (req, res) => {
  try {
    const { id, title, description, category, name, about } = req.body;

    let items = [];
    if (req.body.items) items = JSON.parse(req.body.items);

    // NEW UPLOADED IMAGES
    let newImages = [];

    if (req.files?.images) {
      newImages = req.files.images.map(
        f => "/uploads/project/" + f.filename
      );
    }
    let sectionImage = "";
    if (req.files?.sectionImage && req.files?.sectionImage[0]) {
      sectionImage = "/uploads/project/" + req.files.sectionImage[0].filename;
    }

    // ================= UPDATE =================
    if (id) {
      const project = await Project.findById(id);
      if (!project)
        return res.json({ success: false, message: "Project not found!" });

      //  DELETE ONLY SELECTED IMAGES
      let deletedImages = [];
      if (req.body.deletedImages) {
        deletedImages = JSON.parse(req.body.deletedImages);

        deletedImages.forEach(img => {
          const oldPath = path.join(process.cwd(), img.replace(/^\//, ""));
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        });
      }

      //  KEEP IMAGES WHICH ARE NOT DELETED
      project.images = project.images.filter(
        img => !deletedImages.includes(img)
      );

      //  ADD NEW IMAGES
      project.images.push(...newImages);
      if (sectionImage) {

        if (project.sectionImage) {
          const oldSectionPath = path.join(
            process.cwd(),
            project.sectionImage.replace(/^\//, "")
          );
          if (fs.existsSync(oldSectionPath)) {
            fs.unlinkSync(oldSectionPath);
          }
        }


        project.sectionImage = sectionImage;
      }

      // UPDATE FIELDS
      project.title = title;
      project.description = description;
      project.category = category;
      project.name = name;
      project.about = about;
      project.items = items;

      await project.save();

      return res.json({
        success: true,
        message: "Project updated successfully!",
      });
    }

    // ================= CREATE =================
    const newProject = new Project({
      category,
      title,
      description,
      name,
      about,
      items,
      images: newImages,
      sectionImage: sectionImage,
    });

    await newProject.save();

    res.json({
      success: true,
      message: "Project added successfully!",
    });

  } catch (err) {
    console.error("Error saving project:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





//============================
//  Delete Project
//============================
module.exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res.json({ success: false, message: "Project not found!" });

    if (project.images?.length) {
      project.images.forEach(img => {
        const filePath = path.join(process.cwd(), img.replace(/^\//, ""));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    if (project.sectionImage) {
      const sectionPath = path.join(
        process.cwd(),
        project.sectionImage.replace(/^\//, "")
      );
      if (fs.existsSync(sectionPath)) fs.unlinkSync(sectionPath);
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Project deleted successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};





exports.updateSectionByType = async (req, res) => {
  try {
    let { type, title, label, description } = req.body;

    if (!type) {
      return res.status(200).json({
        success: false,
        message: "Type is required"
      });
    }


    type = type.toLowerCase();

    const existing = await PageSection.findOne({ type });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `No section found for type '${type}'`
      });
    }

    if (title !== undefined) existing.title = title;
    if (label !== undefined) existing.label = label;
    if (description !== undefined) existing.description = description;

    // ======================
    // IMAGE (OPTIONAL)
    // ======================
    if (req.files?.image?.[0]) {
      if (existing.image) {
        const oldPath = path.join(process.cwd(), existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      existing.image = "/uploads/section/" + req.files.image[0].filename;
    }

    // ======================
    // PAGE BG BANNER (OPTIONAL)
    // ======================
    if (req.files?.pageBgBanner?.[0]) {
      if (existing.pageBgBanner) {
        const oldBg = path.join(process.cwd(), existing.pageBgBanner);
        if (fs.existsSync(oldBg)) fs.unlinkSync(oldBg);
      }
      existing.pageBgBanner = "/uploads/section/" + req.files.pageBgBanner[0].filename;
    }

    await existing.save();

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: existing
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};




// ================================
// Seo PAGE
// ================================
exports.getSeoPage = async (req, res) => {
  const admin = await Admin.findOne().lean();
  res.render("Pages/Seosettings", { admin });
};

// ================================
// GET SEO BY PAGE TYPE (TAB CLICK)
// ================================
exports.getSeoByType = async (req, res) => {
  try {
    const { type } = req.params;

    const seo = await Seo.findOne({ type }).lean();

    res.json(seo || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================================
// CREATE OR UPDATE (UPSERT)
// ================================
exports.saveSeo = async (req, res) => {
  try {
    const { type, metaTitle, metaDescription, metaKeywords } = req.body;

    if (!type) {
      return res.json({ success: false, message: "Page type missing" });
    }



    let imagePath = null;

    if (req.file) {
      imagePath = "/uploads/seo/" + req.file.filename;
    }

    // find existing seo by type
    const oldSeo = await Seo.findOne({ type });

    // delete old image if new uploaded
    if (req.file && oldSeo?.seoimage) {
      const oldImgPath = path.join(__dirname, "..", oldSeo.seoimage);
      if (fs.existsSync(oldImgPath)) fs.unlinkSync(oldImgPath);
    }

    await Seo.updateOne(
      { type },
      {
        $set: {
          metaTitle,
          metaDescription,
          metaKeywords,
          ...(imagePath && { seoimage: imagePath })
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "SEO saved successfully!"
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};



// ================================
// Generate Description
// ================================
module.exports.generateDescription = async (req, res) => {
  try {
    const { name, prompt } = req.body;
    if (!name)
      return res.json({ success: false, message: "Product name is required." });

    const contact = await Contact.findOne();
      if (!contact?.companyName || !contact?.aboutcompany) {
  return res.status(200).json({
    success: false,
    message: "Company name or About Company not found. Please Add contact info."
  });
}

    const apikeysetting = await ApikeySetting.findOne({}).lean();

    
    if (!apikeysetting) {
      return res.json({
        success: false,
        message: "API key settings not configured."
      });
    }



    const finalPrompt = `${name}

    Company Name:
    ${contact?.companyName}

    About Company:
    ${contact?.aboutcompany}

    User Instruction:
    ${prompt}

    Generate a detailed, clear and professional description.
        `.trim();

    let description = "";

    // =========================
    // Gemini
    // =========================
    if (apikeysetting.geminiApi?.enabled === true) {

      const apiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apikeysetting.geminiApi?.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
          }),
        }
      );


      if (!apiRes.ok) {
        const errText = await apiRes.text();
        console.error("Gemini API Error:", errText);
        return res
          .status(apiRes.status)
          .json({ success: false, message: "Gemini API request failed.", details: errText });
      }

      const data = await apiRes.json();

      description =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "AI could not generate a description.";
    }

    // =========================
    // OPENAI (IF ENABLED)
    // =========================
    else if (apikeysetting.openAi?.enabled === true) {

   
      const openai = new OpenAI({
        apiKey: apikeysetting.openAi.apiKey
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: finalPrompt }],
      });

      description = response?.choices?.[0]?.message?.content?.trim() ||
          "AI could not generate a description.";
    }

    // =========================
    // NO AI ENABLED
    // =========================
    else {
      return res.json({
        success: false,
        message: "No AI provider enabled."
      });
    }
    res.json({ success: true, description });

  } catch (err) {
    console.error(" AI Description Error:", err);
    res.status(500).json({ success: false, message: "AI generation failed." });
  }
};

// ================================
// Generate  Seo Details
// ================================
module.exports.generateMetaAll = async (req, res) => {
  try {
    const { page } = req.body;
    if (!page)
      return res.json({ success: false, message: "Page type is required." });


    const contact = await Contact.findOne()

   if (!contact?.companyName || !contact?.aboutcompany) {
  return res.status(200).json({
    success: false,
    message: "Company name or About Company not found. Please Add contact info."
  });
}

    // ====== OPTIONAL AI-Generated META (Gemini API v1beta) ======

    const prompt = `You are an SEO expert.
        Generate SEO metadata for "${page}" page.
        Company Name:
    ${contact?.companyName}

    About Company:
    ${contact?.aboutcompany}

        Respond ONLY in valid JSON format like this:
        {
          "metaTitle": "string (max 60 chars)",
          "metaKeywords": "comma separated keywords (max 5 keywords)",
          "metaDescription": "150-160 characters description"
        }
        Do NOT add explanation or extra text.`;


    const apikeysetting = await ApikeySetting.findOne({}).lean();

    if (!apikeysetting) {
      return res.json({
        success: false,
        message: "API key settings not configured."
      });
    }

    let aiResponseText = "";

    if (apikeysetting.geminiApi?.enabled === true) {
      const apiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apikeysetting.geminiApi?.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );


      if (!apiRes.ok) {
        const errText = await apiRes.text();
        console.error("Gemini API Error:", errText);
        return res
          .status(apiRes.status)
          .json({ success: false, message: "Gemini API request failed.", details: errText });
      }

      const data = await apiRes.json();

      aiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    }
    else if (apikeysetting.openAi?.enabled === true) {

      const openai = new OpenAI({
        apiKey: apikeysetting.openAi.apiKey
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],      });

     aiResponseText = response?.choices?.[0]?.message?.content?.trim() || "";
    }
    else {
      return res.json({
        success: false,
        message: "No AI provider enabled",
      });
    }
    const cleanedResult = aiResponseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let meta;
    try {
      meta = JSON.parse(cleanedResult);
    } catch (e) {
      console.error("JSON Parse Error:", cleanedResult);
      return res.json({
        success: false,
        message: "AI returned invalid format"
      });
    }

    return res.json({
      success: true,
      metaTitle: meta.metaTitle || "",
      metaKeywords: meta.metaKeywords || "",
      metaDescription: meta.metaDescription || ""
    });


  } catch (err) {
    console.error("SEO Meta Generation Error:", err);
    res.status(500).json({ success: false, message: "AI generation failed." });
  }
};



// ================================
//  GET: Forget Password Page
// ================================
module.exports.getForgetPassword = async (req, res) => {
  const success = req.session.success || null;
  const error = req.session.error || null;
  req.session.success = null;
  req.session.error = null;

  const setting = await Contact.findOne({}, { logo: 1, favicon: 1 }).lean();

  res.render("Pages/Forgetpassword", { success, error, logo: setting?.logo, favicon: setting?.favicon });

};

// ================================
//  POST: Handle Forget Password
// ================================
module.exports.postForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(200).json({
        success: false,
        message: "Email not found",
      });
    }

    // =========================
    // DELETE OLD TOKENS
    // =========================
    await AdminPasswordResetToken.deleteMany({ adminId: admin._id });

    // =========================
    // CREATE NEW TOKEN
    // =========================
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await new AdminPasswordResetToken({
      adminId: admin._id,
      token,
      expiresAt,
    }).save();

    // =========================
    // RESET LINK
    // =========================
    const baseURL = process.env.BASE_URL;
    const resetLink = `${baseURL}/reset-password/${token}`;

    // =========================
    // EMAIL TEMPLATE
    // =========================
    const html = `
      <div style="font-family: Arial, sans-serif; padding:20px">
        <h2>Password Reset Request</h2>
        <p>Hello Admin,</p>
        <p>You requested to reset your password.</p>
        <p>
          <a href="${resetLink}"
             style="display:inline-block;padding:10px 20px;
             background:#007bff;color:#fff;text-decoration:none;border-radius:5px">
             Reset Password
          </a>
        </p>
        <p>This link will expire in <b>30 minutes</b>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p>Thanks,<br/>GrowLead Team</p>
      </div>
    `;

    // =========================
    // SEND EMAIL (FIX HERE)
    // =========================
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email!",
    });

  } catch (err) {
    console.error(err);
    return res.status(200).json({
      success: false,
      message: "Failed to send reset link",
    });
  }
};


// ================================
//  GET: Reset Password Page
// ================================
module.exports.getResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenDoc = await AdminPasswordResetToken.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      return res.status(200).json({ success: false, message: "Invalid or expired link" });
    }

    const setting = await Contact.findOne({}, { logo: 1, favicon: 1 }).lean();

    res.render("Pages/Resetpassword", { token, logo: setting?.logo, favicon: setting?.favicon });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================================
//  POST: Reset Password
// ================================
module.exports.postResetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    const tokenDoc = await AdminPasswordResetToken.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      return res.status(200).json({ success: false, message: "Invalid or expired token" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(200).json({ success: false, message: "Passwords do not match" });
    }


    const admin = await Admin.findById(tokenDoc.adminId);
    if (!admin) {
      return res.status(200).json({ success: false, message: "User not found" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    await AdminPasswordResetToken.findByIdAndDelete(tokenDoc._id);

    return res.status(200).json({ success: true, message: "Password changed successfully!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports.getSettingjson = async (req, res) => {
  try {
    const data = await Contact.findOne();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};





//=====================================profile==========================================//

module.exports.getprofile = async (req, res) => {
  try {
    const admin = await Admin.findOne()
    res.render('Pages/Profile', {
      admin
    })
  } catch (error) {
    console.log(error);
  }
}


// ================================
// Update Profile (Name + Password)
// ================================
exports.changePassword = async (req, res) => {
  try {
    const { name, currentPassword, newPassword, confirmPassword } = req.body;

    if (!req.session.adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again."
      });
    }

    const admin = await Admin.findById(req.session.adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    if (name && name.trim() !== "") {
      admin.name = name.trim();
    }

    if (currentPassword || newPassword || confirmPassword) {

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.json({
          success: false,
          message: "All password fields are required"
        });
      }

      if (newPassword !== confirmPassword) {
        return res.json({
          success: false,
          message: "New password and confirm password do not match"
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      admin.password = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      name: admin.name
    });

  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again"
    });
  }
};

// ================================
// Update Profile Image
// ================================

module.exports.updateProfileImage = async (req, res) => {
  try {

    const adminId = req.session.adminId;

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Delete old profile image if exists
    if (admin.profile) {
      const oldImagePath = path.join(__dirname, "..", admin.profile);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save new image path in DB
    admin.profile = `/uploads/adminprofile/${req.file.filename}`;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      profile: admin.profile
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};





module.exports.Notificationhistory = async (req, res) => {
  try {
    const admin = await Admin.findOne();
    res.render('Pages/Notificationhistory', {
      admin
    })
  } catch (error) {
    console.log(error);

  }

};


module.exports.getnotification = async (req, res) => {
  try {
    const notifications = await Notification.find({ isRead: false })
      .sort({ createdAt: -1 })

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.json(err);
  }

};


module.exports.notificationread = async (req, res) => {
  try {
    const id = req.params.id;

    await Notification.findByIdAndUpdate(id, { isRead: true });

    res.redirect(`/notificationhistory`);
  } catch (err) {
    res.redirect("/notificationhistory");
  }

};






//============================
//  Get History JSON 
//============================
module.exports.getHistoryJson = async (req, res) => {
  try {
    const histories = await History.find().sort({ createdAt: -1 });
    res.json({ data: histories });
  } catch (err) {
    console.error("Error fetching History JSON:", err);
    res.json({ data: [] });
  }
};

//============================
//  Add or Update History
//============================
module.exports.saveHistory = async (req, res) => {
  try {
    const { id, title, description, year } = req.body;
    let imagePath = null;

    if (req.file) {
      imagePath = "/uploads/history/" + req.file.filename;
    }

    // --- UPDATE EXISTING HISTORY ---
    if (id) {
      const history = await History.findById(id);
      if (!history)
        return res.json({ success: false, message: "History not found" });

      // --- If new image uploaded, remove old image ---
      if (req.file && history.image) {
        const oldPath = path.join(__dirname, "..", history.image);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) console.error("Failed to delete old image:", err);
          });
        }
      }

      // --- Update fields ---
      history.title = title;
      history.description = description;
      history.year = year;
      if (imagePath) history.image = imagePath;

      await history.save();
      return res.json({ success: true, message: "History updated successfully!" });
    }

    // --- CREATE NEW HISTORY ---
    const newHistory = new History({
      title,
      description,
      image: imagePath,
      year,
    });
    await newHistory.save();

    res.json({ success: true, message: "History added successfully!" });
  } catch (err) {
    console.error(" Error saving History:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//============================
//  Get All History
//============================
module.exports.getAllHistory = async (req, res) => {
  try {
    const section = await PageSection.findOne({ type: "history" }).lean();

    const admin = await Admin.findOne();
    res.render("Pages/History", { admin, section });
  } catch (err) {
    console.error("Error fetching History:", err);
    res.status(500).send("Server error");
  }
};

//============================
//  Delete History
//============================
module.exports.deleteHistory = async (req, res) => {
  try {
    const history = await History.findById(req.params.id);
    if (!history) return res.json({ success: false, message: "History not found" });

    if (history.image) {
      const filePath = path.join(process.cwd(), history.image.replace(/^\//, ""));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await history.deleteOne();
    res.json({ success: true, message: "History deleted successfully!" });
  } catch (err) {
    console.error("Error deleting History:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ================================
exports.getNotificationJSON = async (req, res) => {
  try {
    const draw = Number(req.query.draw) || 1;
    const start = Number(req.query.start) || 0;
    const length = Number(req.query.length) || 10;
    const search = req.query["search[value]"]?.trim() || "";

    const matchQuery = {};

    // Search filter
    if (search) {
      const regex = { $regex: search, $options: "i" };
      matchQuery.$or = [
        { message: regex },
        { name: regex },
      ];
    }

    // Total notifications
    const totalRecords = await Notification.countDocuments();

    // Filtered notifications
    const recordsFiltered = await Notification.countDocuments(matchQuery);

    // Fetch paginated data
    const data = await Notification.find(matchQuery)
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(length)
      // 2. Select the fields that match your schema
      .select("_id name message isRead createdAt");

    res.json({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered,
      data,
    });

  } catch (err) {
    console.error("Notification List Error:", err);
    res.json({
      draw: 0,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: [] // Return empty array on error to prevent DataTable crash
    });
  }
};



module.exports.getInquiry = async (req, res) => {
  try {
    const admin = await Admin.findOne()
    res.render('Pages/Getintouch', {
      admin
    })
  } catch (error) {
    console.log(error);
  }
}


// ================================
//  Get In Touch Json
// ================================
module.exports.getinquiryjson = async (req, res) => {
  try {
    const draw = Number(req.query.draw) || 1;
    const start = Number(req.query.start) || 0;
    const length = Number(req.query.length) || 10;

    const search = req.query["search[value]"]?.trim() || "";

    let query = {};

    //  Searching
    if (search) {
      const regex = { $regex: search, $options: "i" };
      query.$or = [
        { name: regex },
        { email: regex },
        { subject: regex },
        { message: regex }
      ];
    }

    // Total Records
    const totalRecords = await GetInTouch.countDocuments();

    // Filtered Records Count
    const filteredRecords = await GetInTouch.countDocuments(query);

    // Fetch Data
    const data = await GetInTouch.find(query)
      .skip(start)
      .limit(length)
      .sort({ createdAt: -1 });

    // Send Response
    res.json({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data
    });

  } catch (err) {
    console.error("Contact List Error:", err);
    res.json({ draw: 0, recordsTotal: 0, recordsFiltered: 0, data: [] });
  }
};
// ================================
// DELETE CONTACT 
// ================================
module.exports.deleteInquiryJSON = async (req, res) => {
  try {
    const id = req.params.id;

    const contact = await GetInTouch.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    await GetInTouch.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Contact deleted successfully!"
    });

  } catch (err) {
    console.error("Delete Contact Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact"
    });
  }
};




exports.getWhyChooseUsPage = async (req, res) => {
  const admin = await Admin.findOne();
  res.render("Pages/Whychooseus", { admin });
}

exports.getSection = async (req, res) => {
  const data = await WhyChooseUs.findOne();
  res.json({ success: true, data });
};

// SAVE OR UPDATE WHY CHOOSE US 
exports.saveSection = async (req, res) => {
  try {
    const { badge, title, description, features, labels } = req.body;

    const exists = await WhyChooseUs.findOne();

    let image;


    if (req.file) {
      image = "/uploads/whychooseus/" + req.file.filename;

      //  DELETE OLD IMAGE IF EXISTS
      if (exists && exists.image) {
        const oldImagePath = path.join(
          process.cwd(),
          exists.image
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const payload = {
      badge,
      title,
      description,
      features,
      labels: labels ? JSON.parse(labels) : []
    };

    if (image) payload.image = image;

    if (exists) {
      await WhyChooseUs.updateOne({}, payload);
    } else {
      await WhyChooseUs.create(payload);
    }

    res.json({
      success: true,
      message: "Why Choose Us section saved successfully"
    });

  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: err.message
    });
  }
};




//========================================== HERO STATS PAGE===========================================//

/* =========================
   HERO STATS PAGE
========================= */
module.exports.getHeroStats = async (req, res) => {
  try {
    const admin = await Admin.find();
    res.render("Pages/Herostat", { admin });
  } catch (err) {
    console.log(err);
  }
};

/* =========================
   HERO STATS JSON
========================= */
module.exports.getHeroStatsJson = async (req, res) => {
  try {
    const dataList = await HeroStat.find().sort({ createdAt: -1 });
    const data = dataList.map((h) => ({
      _id: h._id,
      label: h.label,
      count: h.count,
      shortdescription: h.shortdescription,
    }));
    res.json({ data });
  } catch (err) {
    res.json({ data: [] });
  }
};

/* =========================
   SAVE / UPDATE
========================= */
module.exports.saveHeroStats = async (req, res) => {
  try {
    const { id, label, count, shortdescription } = req.body;

    if (!label || !count) {
      return res.json({ success: false, message: "All fields required" });
    }

    if (id) {
      await HeroStat.findByIdAndUpdate(id, { label, count, shortdescription });
      return res.json({ success: true, message: "Updated successfully" });
    }

    await HeroStat.create({ label, count, shortdescription });
    res.json({ success: true, message: "Added successfully" });

  } catch (err) {
    res.json({ success: false, message: "Save failed" });
  }
};

/* =========================
   DELETE
========================= */
module.exports.deleteHeroStats = async (req, res) => {
  try {
    await HeroStat.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.json({ success: false, message: "Delete failed" });
  }
};



// =======================
// PAGE LOAD
// =======================
exports.getHowItWork = async (req, res) => {
  try {
    const section = await PageSection.findOne({ type: "howitwork" });
    const admin = await Admin.find();
    res.render("Pages/Howitwork", { admin, section });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// =======================
// JSON (DATATABLE)
// =======================
exports.getHowItWorkJson = async (req, res) => {
  try {
    const list = await HowItWork.find().sort({ createdAt: -1 });
    res.json({ data: list });
  } catch {
    res.json({ data: [] });
  }
};

// =======================
// SAVE / UPDATE
// =======================
exports.saveHowItWork = async (req, res) => {
  try {
    const { id } = req.body;
    const items = JSON.parse(req.body.items || "[]");

    let image, bgImage;

    if (req.files?.image) {
      image = "/uploads/howitwork/" + req.files.image[0].filename;
    }

    if (req.files?.backgroundImage) {
      bgImage = "/uploads/howitwork/" + req.files.backgroundImage[0].filename;
    }

    const exists = await HowItWork.findOne();

    // ===============================
    // UPDATE CASE
    // ===============================
    if (exists) {
      const updateObj = { items };

      // ---- IMAGE REPLACE ----
      if (image) {
        if (exists.image) {
          const oldPath = path.join(process.cwd(), exists.image);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        updateObj.image = image;
      }

      // ---- BACKGROUND IMAGE REPLACE ----
      if (bgImage) {
        if (exists.backgroundImage) {
          const oldBgPath = path.join(process.cwd(), exists.backgroundImage);
          if (fs.existsSync(oldBgPath)) {
            fs.unlinkSync(oldBgPath);
          }
        }
        updateObj.backgroundImage = bgImage;
      }

      await HowItWork.updateOne({}, updateObj);

      return res.json({
        success: true,
        message: "Updated successfully"
      });
    }

    // ===============================
    // CREATE CASE
    // ===============================
    await HowItWork.create({
      items,
      image: image || "",
      backgroundImage: bgImage || ""
    });

    res.json({
      success: true,
      message: "Added successfully"
    });

  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Save failed"
    });
  }
};


// =======================
// DELETE
// =======================
exports.deleteHowItWork = async (req, res) => {
  try {
    const data = await HowItWork.findById(req.params.id);

    if (data?.image) {
      const imgPath = path.join(__dirname, "..", data.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await HowItWork.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted successfully" });
  } catch {
    res.json({ success: false, message: "Delete failed" });
  }
};





//========================================== Banners ==========================================//
//============================
// Get all banners
//============================
module.exports.getAllGallery = async (req, res) => {
  try {
    const admin = await Admin.findOne();
    const gallery = await Gallery.find().sort({ _id: -1 });
    res.render("Pages/Gallery", { gallery, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//============================
// Get All Gallery Json
//============================
module.exports.getAllGalleryjson = async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });

    res.json({ data: gallery });
  } catch (err) {
    console.error("getAllGallery error:", err);

    res.status(500).json({ data: [] });
  }
};

//============================
// Add or Edit Gallery
//============================
module.exports.saveGallery = async (req, res) => {
  try {
    const { id } = req.body;
    let imagePath = null;

    // --- If new image uploaded ---
    if (req.file) {
      imagePath = "/uploads/gallery/" + req.file.filename;
    }

    // --- Edit mode ---
    if (id) {
      const gallery = await Gallery.findById(id);
      if (!gallery) return res.status(404).json({ success: false, message: "Gallery not found" });

      // --- If new image uploaded, remove old one ---
      if (imagePath && gallery.image) {
        const oldPath = path.join(process.cwd(), gallery.image.startsWith("/") ? gallery.image.substring(1) : gallery.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }



      if (imagePath) gallery.image = imagePath;
      await gallery.save();

      return res.json({ success: true, message: "Banner updated successfully!" });
    }

    // --- Add mode ---
    const newGallery = new Gallery({

      image: imagePath,
    });
    await newGallery.save();
    res.json({ success: true, message: "Gallery added successfully!" });

  } catch (error) {
    console.error("Error saving gallery:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//============================
// Delete Gallery
//============================
module.exports.deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findById(id);
    if (!gallery) return res.status(404).json({ success: false, message: "Gallery not found" });

    // --- Delete image from folder ---
    if (gallery.image) {
      const filePath = path.join(process.cwd(), gallery.image.startsWith("/") ? gallery.image.substring(1) : gallery.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Gallery.findByIdAndDelete(id);
    res.json({ success: true, message: "Banner deleted successfully!" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




// =======================
// PAGE LOAD
// =======================

exports.getHeroSection = async (req, res) => {
  try {
    const admin = await Admin.findOne();
    res.render("Pages/Herosection", { admin });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

/* =======================
   GET JSON (DATATABLE)
======================= */
exports.getHerosectionjson = async (req, res) => {
  try {
    const list = await HeroSection.find().sort({ createdAt: -1 });
    res.json({ data: list });
  } catch (err) {
    console.error(err);
    res.json({ data: [] });
  }
};

/* =======================
   SAVE / UPDATE
======================= */
exports.saveHeroSection = async (req, res) => {
  try {
    // 1. Destructure label from req.body
    const { id, label, title, description } = req.body;

    if (!title || !description) {
      return res.json({
        success: false,
        message: "Title and description are required"
      });
    }

    let mediaPath = "";
    if (req.file) {
      mediaPath = "/uploads/hero/" + req.file.filename;
    }

    /* =======================
       UPDATE EXISTING
    ======================= */
    if (id) {
      const old = await HeroSection.findById(id);
      if (!old) {
        return res.json({ success: false, message: "Record not found" });
      }

      if (mediaPath && old.media) {
        const oldPath = path.join(process.cwd(), old.media);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // 2. Update label here
      old.label = label;
      old.title = title;
      old.description = description;
      if (mediaPath) old.media = mediaPath;

      await old.save();

      return res.json({
        success: true,
        message: "Updated successfully"
      });
    }

    /* =======================
       CREATE NEW
    ======================= */
    if (!req.file) {
      return res.json({
        success: false,
        message: "Media is required"
      });
    }

    // 3. Save label here
    await HeroSection.create({
      label,
      title,
      description,
      media: mediaPath
    });

    res.json({
      success: true,
      message: "Added successfully"
    });

  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Save failed"
    });
  }
};

/* =======================
   DELETE
======================= */
exports.deleteHeroSection = async (req, res) => {
  try {
    const data = await HeroSection.findById(req.params.id);

    if (!data) {
      return res.json({
        success: false,
        message: "Record not found"
      });
    }

    if (data.media) {
      const mediaPath = path.join(process.cwd(), data.media);
      if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
    }

    await HeroSection.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Delete failed"
    });
  }
};



exports.getCtaSection = async (req, res) => {
  try {
    const admin = await Admin.findOne();
    const section = await PageSection.findOne({ type: "cta" }).lean();
    res.render('Pages/CTA', { admin, section });
  } catch (err) { console.error(err); res.status(500).send("Server Error"); }
}

exports.updateCtaByType = async (req, res) => {
  try {
    let { type, title, label, description } = req.body;

    if (!type || !title || !label) {
      return res.status(200).json({
        success: false,
        message: "Type, title and label are required",
      });
    }

    type = type.toLowerCase();

    const existing = await PageSection.findOne({ type });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `No section found for type '${type}'`,
      });
    }

    // --- Update mandatory fields ---
    existing.title = title;
    existing.label = label;

    // --- Update optional description if provided ---
    if (description !== undefined) existing.description = description;

    // --- Handle image replacement ---
    if (req.file) {
      // Delete old image if exists
      if (existing.image) {
        const oldPath = path.join(process.cwd(), existing.image.replace(/^\//, ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Set new image path
      existing.image = "/uploads/cta/" + req.file.filename;
    }

    await existing.save();

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: existing,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



// =======================
// Section Setting
//======================= 

exports.getSectionSettings = async (req, res) => {
  try {
    const admin = await Admin.findOne();
    const section = await SectionSetting.find();
    res.render('Pages/Sectionsetting', { admin, section });
  } catch (err) { console.error(err); res.status(500).send("Server Error"); }
}

exports.saveSectionSettings = async (req, res) => {
  try {
    const { sectionType, items } = req.body;

    await SectionSetting.findOneAndUpdate(
      { sectionType },
      { items },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "Section updated successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
}


// =======================
// contact page
//======================= 

exports.getContactuspage = async (req, res) => {
  try {
    const admin = await Admin.findOne();
    const section = await PageSection.findOne({ type: "contact" });
    res.render('Pages/Contactuspage', { admin, section });
  } catch (err) { console.error(err); res.status(500).send("Server Error"); }
}


//========================================== Export database ==========================================//


exports.getExportdatabase = async (req, res) => {
  try {
    const admin = await Admin.findOne();
    res.render('Pages/Exportdatabase', { admin });
  } catch (err) { console.error(err); res.status(500).send("Server Error"); }
}


const archiver = require("archiver");
const { MongoClient } = require("mongodb");

module.exports.exportDatabase = async (req, res) => {
  const client = new MongoClient(process.env.MONGO_URL);

  try {
    await client.connect();
    const db = client.db();

    // ZIP headers
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=exportdatabase.zip"
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      const data = await db.collection(col.name).find({}).toArray();

      archive.append(
        JSON.stringify(data, null, 2),
        { name: `${col.name}.json` }
      );
    }

    await archive.finalize();

  } catch (err) {
    console.error("Export Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false });
    }
  } finally {
    await client.close();
  }
};



//===============================
//api key setting
//==============================
exports.getapikeysetting = async (req, res) => {
  const admin = await Admin.findOne().lean();

  let setting = await ApikeySetting.findOne().lean();
  if (!setting) {
    setting = await ApikeySetting.create({});
  }

  res.render("Pages/Apikeysetting", { admin, setting });
};


exports.updateApikeySettings = async (req, res) => {
  try {
    const updateData = {};


    for (const key in req.body) {
      updateData[key] = {
        enabled: req.body[key].enabled === true,
        apiKey: req.body[key].apiKey || ""
      };
    }

    await ApikeySetting.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true }
    );

    return res.status(200).json({ success: true, message: "Lead settings updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err });
  }
};