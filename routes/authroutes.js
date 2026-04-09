const express = require("express");
const router = express.Router();
const authcontroller = require("../controllers/authcontroller");

// Auth routes
router.get("/getblog", authcontroller.getBlogs); // Fetch blogs
router.get("/getblogdetails/:id", authcontroller.getBlogDetail); // Fetch detailed blog info by ID
router.get("/categories", authcontroller.getCategories);//category api
router.get("/project", authcontroller.getProjects);// product api
router.get("/relatedprojects/:projectId", authcontroller.getRelatedProjects);// product
router.get("/setting", authcontroller.getContactInfo);// contact api
router.post("/newsletter", authcontroller.subscribeNewsletter);// newsletter api
router.post("/getintouch", authcontroller.submitGetInTouch);// get in touch api
router.get("/testimonials", authcontroller.getTestimonials);// testimonial api
router.get("/faq", authcontroller.getFaqs);// faq api
router.get("/seo", authcontroller.getAllSeoSettings);// seo api
router.get('/exibitions',authcontroller.getAllExhibitions);// exhibition api
router.get('/catalogue',authcontroller.getAllCatalogue);// exhibition api
router.get('/service',authcontroller.getServices);// service api
router.get("/getabout", authcontroller.getAbout);// about api
router.get("/gethistory", authcontroller.getHistory);// history api
router.get("/whychooseus", authcontroller.getWhyChooseUs);// why choose us api
router.get("/getstat", authcontroller.getstats);// how it work api
router.get("/howitwork", authcontroller.getHowItWork);// how it work api
router.get("/getgallery", authcontroller.getGallery);// gallery api
router.get("/herosection", authcontroller.getHeroSection);// hero section api
router.get("/ctasection", authcontroller.getCtaSection);// cta section api
router.get("/sectionsetting",authcontroller.getSectionSettings)// get section setting
module.exports = router;