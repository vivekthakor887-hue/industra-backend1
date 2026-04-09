const Blog = require("../models/Blog");
const PageSection = require('../models/PageSection');
const Category = require("../models/Category");
const Project = require("../models/Project");
const Contact = require("../models/Contact");
const Newsletter = require("../models/Newsletter");
const GetInTouch = require("../models/GetInTouch");
const Testimonial = require("../models/Testimonial");
const Faq = require("../models/Faq");
const SeoSetting = require("../models/Seo");
const Exhibition = require("../models/Exhibition");
const Service = require("../models/Service");
const Notification = require("../models/Notification");
const About = require("../models/About");
const History = require("../models/History");
const WhyChooseUs = require("../models/WhyChooseUs");
const HeroStat = require("../models/Herostat");
const HowItWork = require("../models/HowItWork");
const Gallery = require("../models/Gallery");
const HeroSection = require("../models/HeroSection");
const SectionSetting=require('../models/SectionSetting');
const Catalogue = require('../models/catalogueModel');

//========================================== FRONTEND CONTROLLERS ==========================================//
// Fetch blogs with category populated
exports.getBlogs = async (req, res) => {
  try {
    const pagesection = await PageSection.findOne({ type: 'blog' });

    const blogs = await Blog.find()
      .populate("category", "title")
      .sort({ createdAt: -1 })
      .select("title description thumbnail category date createdAt");

      const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formattedBlogs = blogs.map(blog => ({
      _id: blog._id,
      title: blog.title,
      author: "By Admin",
      description: blog.description,
      thumbnail: blog.thumbnail,
      category: blog.category?.title || "",
      date: formatDate(blog.date),
    }));

        // =========================
    // RECENT BLOGS (latest 5)
    // =========================
    const recentBlogs = await Blog.find()
      .populate("category", "title")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title thumbnail category date createdAt");

    // =========================
    // RELATED BLOGS (by first blog category)
    // =========================
    let relatedBlogs = [];
    if (blogs.length && blogs[0].category) {
      relatedBlogs = await Blog.find({
        category: blogs[0].category._id,
      })
        .populate("category", "title")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title thumbnail category date createdAt");
    }


    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      total: formattedBlogs.length,
      lable: pagesection?.label || '',
      title: pagesection?.title || '',
      description: pagesection?.description || '',
      banner:pagesection?.pageBgBanner||'',
      data: formattedBlogs,
        recentBlogs: recentBlogs.map(b => ({
        _id: b._id,
        title: b.title,
        thumbnail: b.thumbnail,
        category: b.category?.title || "",
        date: formatDate(b.date),
      })),

      relatedBlogs: relatedBlogs.map(b => ({
        _id: b._id,
        title: b.title,
        thumbnail: b.thumbnail,
        category: b.category?.title || "",
        date: formatDate(b.date),
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Fetch detailed blog info by ID
exports.getBlogDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // =========================
    // MAIN BLOG DETAIL
    // =========================
    const blog = await Blog.findById(id)
      .populate("category", "title")
      .select("title description image category date createdAt");

    if (!blog) {
      return res.status(200).json({
        success: false,
        message: "Blog not found",
      });
    }

      const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };
    // =========================
    // RECENT BLOGS (latest 5)
    // =========================
    const recentBlogs = await Blog.find({
      _id: { $ne: blog._id },
    })
      .populate("category", "title")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title thumbnail category date createdAt");

    // =========================
    // RELATED BLOGS (same category)
    // =========================
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      category: blog.category._id,
    })
      .populate("category", "title")
      .sort({ createdAt: -1 })
      .select("title thumbnail category date createdAt");

    // =========================
    // FORMAT RESPONSE
    // =========================
    const formatBlog = (b) => ({
      _id: b._id,
      title: b.title,
      author: "By Admin",
      description: b.description,
      image: b.image,
      category: b.category?.title || "",
      date: formatDate(b.date),
    });

    return res.status(200).json({
      success: true,
      message: "Blog detail fetched successfully",

      blog: formatBlog(blog),

      recentBlogs: recentBlogs.map(b => ({
        _id: b._id,
        title: b.title,
        thumbnail: b.thumbnail,
        category: b.category?.title || "",
        date: formatDate(b.date),
      })),

      relatedBlogs: relatedBlogs.map(b => ({
        _id: b._id,
        title: b.title,
        author: "By Admin",
        thumbnail: b.thumbnail,
        category: b.category?.title || "",
        date: formatDate(b.date),
      })),
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// category
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ title: 1 })
      .select("_id title");

    const formattedCategories = categories.map(cat => ({
      _id: cat._id,
      name: cat.title,
    }));

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      total: formattedCategories.length,
      data: formattedCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// project exports
exports.getProjects = async (req, res) => {
  try {
    const pagesection = await PageSection.findOne({ type: 'project' });
    const projects = await Project.find()
      .populate("category", "title")
      .sort({ createdAt: -1 })
      .select("title description images  category year items name about createdAt sectionImage");

    const formattedProjects = projects.map(p => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      images: Array.isArray(p.images) ? p.images : p.images ? [p.images] : [],
      image: p.images && !Array.isArray(p.images) ? p.images : p.images && p.images.length > 0 ? p.images[0] : "",
      name: p.name || "",
      about: p.about || "",
      category: p.category?.title || "",
      items: Array.isArray(p.items) ? p.items : [],
      createdAt: p.createdAt,
      sectionImage:p.sectionImage
    }));

    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      total: formattedProjects.length,
      label: pagesection?.label || '',
      title: pagesection?.title || '',
      description: pagesection?.description || '',
      banner:pagesection?.pageBgBanner||'',
      data: formattedProjects,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getRelatedProjects = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(200).json({
        success: false,
        message: "Project ID is required",
      });
    }

    // Find the original project to get its category
    const originalProject = await Project.findById(projectId).select("category");

    if (!originalProject) {
      return res.status(200).json({
        success: false,
        message: "Project not found",
      });
    }

    const categoryId = originalProject.category;

    if (!categoryId) {
      return res.status(200).json({
        success: true,
        message: "No related projects found",
        data: [],
      });
    }

    //  Fetch all other projects with same category (exclude original project)
    const projects = await Project.find({
      category: categoryId,
      _id: { $ne: projectId },
    })
      .populate("category", "title")
      .sort({ createdAt: -1 })
      .select("title description images name about items category createdAt sectionImage");

    //  Format response exactly like main project
    const formattedProjects = projects.map((p) => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      images: Array.isArray(p.images) ? p.images : p.images ? [p.images] : [],
      image: p.images && !Array.isArray(p.images) ? p.images : p.images && p.images.length > 0 ? p.images[0] : "",
      name: p.name || "",
      about: p.about || "",
      category: p.category?.title || "",
      items: Array.isArray(p.items) ? p.items : [],
      createdAt: p.createdAt,
      sectionImage:p.sectionImage
    }));

    return res.status(200).json({
      success: true,
      message: "Related projects fetched successfully",
      total: formattedProjects.length,
      data: formattedProjects,
    });
  } catch (error) {
    console.error("Error fetching related projects:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// countact
exports.getContactInfo = async (req, res) => {
  try {
    const pagesection = await PageSection.findOne({ type: 'contact' });
    const contact = await Contact.findOne().select(
      "companyName email address phones logo darkLogo favicon socialLinks workingtime aboutcompany primaryColor secondaryColor accentColor generalBorderRadius buttonRadius badgeLayout generalFont headerFont createdAt updatedAt"
    );

    if (!contact) {
      return res.status(200).json({
        success: false,
        message: "Contact information not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact information fetched successfully",
      label: pagesection?.label || '',
      title: pagesection?.title || '',
      description: pagesection?.description || '',
      banner:pagesection?.pageBgBanner||'',
      data: {
        companyName: contact.companyName,
        email: contact.email,
        address: contact.address,
        phones: contact.phones || [],
        logo: contact.logo,
        darkLogo: contact.darkLogo,
        favicon: contact.favicon,
        socialLinks: {
          facebook: contact.socialLinks?.facebook || "",
          instagram: contact.socialLinks?.instagram || "",
          x: contact.socialLinks?.x || "",
          linkedin: contact.socialLinks?.linkedin || "",
          youtube: contact.socialLinks?.youtube || "",
        },
        workingtime: contact.workingtime || [],
        aboutcompany: contact.aboutcompany || "",
       primaryColor: contact.primaryColor,
       secondaryColor: contact.secondaryColor,
       accentColor: contact.accentColor,
       generalBorderRadius: contact.generalBorderRadius,
       buttonRadius: contact.buttonRadius,
       badgeLayout: contact.badgeLayout,
       generalFont: contact.generalFont,
       headerFont: contact.headerFont,
       createdAt: contact.createdAt,
       updatedAt: contact.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//subscribe newsletter
exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(200).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscriber = await Newsletter.create({ email });

    // --- CREATE NOTIFICATION ---
    await Notification.create({
      name: email,
      message: `New newsletter subscription`,
    });
    return res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      data: {
        email: subscriber.email,
      },
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Email already subscribed",
    });
  }
}

//get in touch
exports.submitGetInTouch = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!name || !email || !subject || !message) {
      return res.status(200).json({
        success: false,
        message: "All fields are required",
      });
    }

    // =========================
    // SAVE DATA
    // =========================
    await GetInTouch.create({
      name,
      email,
      subject,
      message,
    });

    // --- CREATE NOTIFICATION ---
    await Notification.create({
      name,
      message: `New Get In Touch message from ${name}`,
    });


    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//testimonial
exports.getTestimonials = async (req, res) => {
  try {
    const pagesection = await PageSection.findOne({ type: "testimonials" });

    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .select("clientName quote location rating createdAt");

    const formattedTestimonials = testimonials.map(t => ({
      _id: t._id,
      clientName: t.clientName,
      quote: t.quote,
      location: t.location || "",
      rating: t.rating,
      createdAt: t.createdAt,
    }));

    // =========================
    // CALCULATE AVERAGE RATING
    // =========================
    const totalReviews = testimonials.length;

    const averageRating =
      totalReviews > 0
        ? (
          testimonials.reduce((sum, t) => sum + t.rating, 0) / totalReviews
        ).toFixed(1)
        : 0;

    return res.status(200).json({
      success: true,
      message: "Testimonials fetched successfully",
      total: totalReviews,
      overallRating: Number(averageRating),
      label: pagesection?.label || "",
      title: pagesection?.title || "",
      description: pagesection?.description || '',
      data: formattedTestimonials,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//FAQ
exports.getFaqs = async (req, res) => {
  try {
    const pagesection = await PageSection.findOne({ type: "faq" });

    const faqs = await Faq.find()
      .sort({ createdAt: -1 })
      .select("question answer -_id");

    const formattedFaqs = faqs.map(faq => ({
      _id: faq._id,
      question: faq.question,
      answer: faq.answer,
      createdAt: faq.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "FAQs fetched successfully",
      total: formattedFaqs.length,
      label: pagesection?.label || "",
      title: pagesection?.title || "",
      description: pagesection?.description || '',
      banner:pagesection?.pageBgBanner||'',
      data: formattedFaqs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//seo 

exports.getAllSeoSettings = async (req, res) => {
  try {
    const seoList = await SeoSetting.find()
      .sort({ createdAt: -1 })
      .select("type metaTitle metaDescription metaKeywords");

    const formattedSeo = seoList.map(seo => ({
      type: seo.type,
      metaTitle: seo.metaTitle,
      metaDescription: seo.metaDescription,
      metaKeywords: seo.metaKeywords,
      createdAt: seo.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "All SEO settings fetched successfully",
      total: formattedSeo.length,
      data: formattedSeo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


//exhibition
exports.getAllExhibitions = async (req, res) => {
  try {
    const pagesection = await PageSection.findOne({ type: "exhibition" });

    const exhibitions = await Exhibition.find()
      .sort({ date: -1 })
      .select("title location image date createdAt");

    const formattedExhibitions = exhibitions.map(e => ({
      title: e.title,
      location: e.location,
      image: e.image,
      date: e.date,
      createdAt: e.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Exhibitions fetched successfully",
      total: formattedExhibitions.length,
      label: pagesection?.label || "",
      title: pagesection?.title || "",
      description: pagesection?.description || '',
      banner:pagesection?.pageBgBanner||'',
      data: formattedExhibitions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
//catalogue
exports.getAllCatalogue = async (req, res) => {
  try {
    const pagesection = await PageSection.findOne({ type: "catalog" });

    const exhibitions = await Catalogue.find()
      .sort({ createdAt: -1 })
      .select("title location image pdf createdAt");

    const formattedData = exhibitions.map(e => ({
      title: e.title,
      pdf: e.pdf,
      image: e.image
    }));

    return res.status(200).json({
      success: true,
      message: "Catalogue fetched successfully",
      total: formattedData.length,
      label: pagesection?.label || "",
      title: pagesection?.title || "",
      description: pagesection?.description || '',
      banner:pagesection?.pageBgBanner||'',
      data: formattedData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
//services
exports.getServices = async (req, res) => {
  try {
    const pagesection = await PageSection.findOne({ type: "service" });

    const services = await Service.find()
      .sort({ createdAt: -1 })
      .select("title description image features labels createdAt");

     const formattedServices = services.map(s => {
      const featuresArr = s.features
        ? s.features.split(",").map(f => f.trim())
        : [];

      const labelsArr = Array.isArray(s.labels) ? s.labels : [];

      const maxLen = Math.max(featuresArr.length, labelsArr.length);
      const featureLabelPairs = [];
      for (let i = 0; i < maxLen; i++) {
        featureLabelPairs.push({
          feature: featuresArr[i] || "",
          label: labelsArr[i] || "",
        });
      }

      return {
        _id: s._id,
        title: s.title,
        description: s.description,
        image: s.image,
        createdAt: s.createdAt,
        features: featureLabelPairs,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Services fetched successfully",
      total: formattedServices.length,
      label: pagesection?.label || "",
      title: pagesection?.title || "",
      description: pagesection?.description || '',
      banner:pagesection?.pageBgBanner||'',
      backgroundImage: pagesection?.image || "",
      data: formattedServices,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// about
exports.getAbout = async (req, res) => {
  try {

    const pagesection = await PageSection.findOne({ type: "about" });

    const about = await About.findOne().sort({ createdAt: -1 });

    if (!about) {
      return res.status(200).json({
        success: true,
        message: "No About section found",
        total: 0,
        data: [],
      });
    }

    const featuresArr = about.features
      ? about.features.split(",").map(f => f.trim())
      : [];

    const labelsArr = Array.isArray(about.labels) ? about.labels : [];

    const maxLen = Math.max(featuresArr.length, labelsArr.length);

    const featureLabelPairs = [];

    for (let i = 0; i < maxLen; i++) {
      featureLabelPairs.push({
        title: featuresArr[i] || "",
        description: labelsArr[i] || "",
      });
    }

    // Format About for response
    const formattedAbout = {
      _id: about._id,
      label: about.badge || "",
      title: about.title,
      paragraphs: about.description,
      shortDescription: about.shortDescription, 
      featureLabelPairs,
       images: {
        primary: about.image || "",
        secondary: about.imagesecond || "",
      },
      video: about.video || "",
      experience: about.experience || 0,
      banner:pagesection?.pageBgBanner||'',
      createdAt: about.createdAt,
      updatedAt: about.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "About section fetched successfully",
      total: 1,
      data: formattedAbout,
    });
  } catch (error) {
    console.error("Error fetching About:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// history
exports.getHistory = async (req, res) => {
  try {
    const pagesection = await PageSection.findOne({ type: "history" });

    const history = await History.find().sort({ createdAt: -1 });

    if (!history) {
      return res.status(200).json({
        success: true,
        message: "No history found",
        total: 0,
        data: [],
      });
    }

    const formattedHistory = history.map(item => ({
      title: item.title,
      description: item.description,
      image: item.image || "",
      year: item.year,
      createdAt: item.createdAt,
    }));
    return res.status(200).json({
      success: true,
      message: "History section fetched successfully",
      total: 1,
      label: pagesection?.label || "",
      title: pagesection?.title || "",
      description: pagesection?.description || "",
      data: formattedHistory,
    });

  } catch (error) {
    console.error("Error fetching History:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// why choose us
exports.getWhyChooseUs = async (req, res) => {
  try {
    const section = await WhyChooseUs.findOne().sort({ createdAt: -1 });

    if (!section) {
      return res.status(200).json({
        success: true,
        message: "No Why Choose Us data found",
        total: 0,
        data: [],
      });
    }

    // ===============================
    // FEATURE + LABEL PAIR FIX
    // ===============================
    const featuresArr = section.features
      ? section.features.split(",").map(f => f.trim())
      : [];

    const labelsArr = Array.isArray(section.labels)
      ? section.labels
      : [];

    const maxLen = Math.max(featuresArr.length, labelsArr.length);

    const featureLabelPairs = [];

    for (let i = 0; i < maxLen; i++) {
      featureLabelPairs.push({
        feature: featuresArr[i] || "",
        label: labelsArr[i] || "",
      });
    }

    // ===============================
    // RESPONSE FORMAT (NO BREAKING)
    // ===============================
    const formattedData = {
      _id: section._id,
      title: section.title,
      badge: section.badge,
      description: section.description,
      image: section.image || "",
      featureLabelPairs, 
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "Why Choose Us fetched successfully",
      total: 1,
      data: formattedData,
    });

  } catch (error) {
    console.error("Error fetching WhyChooseUs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// hero stats
exports.getstats = async (req, res) => {
  try {
    const stats = await HeroStat.find()
      .select("label count shortdescription -_id")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("HeroStat frontend error:", error);
    return res.status(500).json({
      success: false,
      data: [],
      message: "Failed to load hero stats",
    });
}
};

// how it work
exports.getHowItWork = async (req, res) => {
  try {
        const pagesection = await PageSection.findOne({ type: "howitwork" });
    const data = await HowItWork.findOne()
      .sort({ createdAt: -1 })
      .select("items image backgroundImage -_id");

    if (!data) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          image: "",
          backgroundImage: ""
        }
      });
    }

    return res.status(200).json({
      success: true,
      label: pagesection?.label || "",
      title: pagesection?.title || "",
      description: pagesection?.description || '',
      data: {
        items: data.items || [],
        image: data.image || "",
        backgroundImage: data.backgroundImage || ""
      }
    });
  } catch (error) {
    console.error("HowItWork frontend error:", error);
    return res.status(500).json({
      success: false,
      data: {
        items: [],
        image: "",
        backgroundImage: ""
      },
      message: "Failed to load How It Work section"
    });
  }
};


// gallery
exports.getGallery = async (req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });

    const formatted = items.map(item => ({
      image: item.image,
    }));

    res.status(200).json({
      success: true,
      message: "Gallery fetched successfully",
      total: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error("Error fetching gallery:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// hero section
exports.getHeroSection = async (req, res) => {
  try {
    const heroList = await HeroSection.find().sort({ createdAt: -1 });
    const heroStats = await HeroStat.find()
      .select("label count shortdescription -_id")
      .sort({ createdAt: -1 });

    const formatted = heroList.map((item, index) => {
      const statIndex = index % heroStats.length;

      return {
        label: item.label || "",
        heading: item.title || "",
        paragraph: item.description || "",
        image_src: item.media || "",
        stat_number: heroStats[statIndex]?.count || 0,
        stat_text: heroStats[statIndex]?.label || "",
        stat_list: heroStats[statIndex]?.shortdescription || "",
      };
    });

    res.status(200).json({
      success: true,
      message: "Hero sections fetched successfully",
      total: formatted.length,
      data: formatted,
    });
  } catch (err) {
    console.error("Error fetching Hero Sections:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// cta section
exports.getCtaSection = async (req, res) => {
  try {
    const cta = await PageSection.findOne({ type: "cta" }).lean();
 const contact = await Contact.findOne().lean();
    if (!cta) {
      return res.status(200).json({
        success: false,
        message: "CTA section not found"
      });
    }

    // --- Frontend friendly response ---
    return res.status(200).json({
      success: true,
      data: {
        title: cta.title || "",
        label: cta.label || "",
        description: cta.description || "",
        image: cta.image || "",
        contactNumber: contact?.phones?.[0] || ""
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

//sectionsetting
exports.getSectionSettings = async (req, res) => {
  try {
    const { sectionType } = req.params;

    // Section meta

    // Section items
    const items = await SectionSetting
      .find({ section_type: sectionType })
      .sort({ display_order: 1 });

    return res.status(200).json({
      success: true,
      message: "Section settings fetched successfully",
      sectionType,
      total: items.length,
      data: items
    });

  } catch (error) {
    console.error("Error fetching section settings:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
