const express = require("express");
const router = express.Router();
const dashboardroutes = require("../controllers/dashboardcontrollers");
const upload = require("../middewares/upload");
const aboutupload = upload.aboutupload;
const heroSingle = upload.heroSingle;
const { AuthMiddleware } = require('../middewares/authMiddleware');



// login apis 

router.get("/loginpage", dashboardroutes.loginpage);//get login-page
router.post("/signup", dashboardroutes.signup);//signup 
router.post("/login", dashboardroutes.login);// login
router.get("/logout", dashboardroutes.logout);//logout

//get dashboard
router.get('/', AuthMiddleware, dashboardroutes.getDashboard)




//About apis

router.get("/about", AuthMiddleware, dashboardroutes.renderAboutPage);// get about page
router.get("/getaboutjson", AuthMiddleware, dashboardroutes.getAllAbouts);// get about data json
router.post("/addabout", AuthMiddleware, aboutupload.fieldsWithSizeError([
  { name: "image", maxCount: 1 },
  { name: "imagesecond", maxCount: 1 },
  { name: "video", maxCount: 1 }
]), upload.validateDimensions, dashboardroutes.saveAbout);//add adout data
router.delete("/about/delete/:id", AuthMiddleware, dashboardroutes.deleteAbout);//delete about



//Blogpage apis
router.get("/blog", AuthMiddleware, dashboardroutes.renderBlogPage);// get blog page
router.post("/addblog", AuthMiddleware, upload.singleWithSizeError("image"), upload.validateDimensions, upload.generateThumbnail, dashboardroutes.addBlog);// add blog
router.get("/getblogjson", AuthMiddleware, dashboardroutes.getBlogJson);// get blog data json 
router.delete("/blog/delete/:id", AuthMiddleware, dashboardroutes.deleteBlog);// delete blog




//Exhibition apis 
router.get('/exhibition', AuthMiddleware, dashboardroutes.getAllExhibition)//get exhibition page
router.get("/getexhibitionjson", AuthMiddleware, dashboardroutes.getExhibitionJson);// get exhibition data json
router.post("/saveExhibition", AuthMiddleware, upload.singleWithSizeError("image"),dashboardroutes.saveExhibition);//add exhibition
router.delete("/exhibition/delete/:id", AuthMiddleware, dashboardroutes.deleteExhibition);//delete exhibition





//Service apis
router.get('/service', AuthMiddleware, dashboardroutes.getAllService)// get product page
router.get("/getservicejson", AuthMiddleware, dashboardroutes.getServiceJson);//get product data json
router.post("/saveservice", AuthMiddleware, upload.singleWithSizeError("image"), upload.validateDimensions, dashboardroutes.saveService);//add product
router.delete("/service/delete/:id", AuthMiddleware, dashboardroutes.deleteService);//delete product


//Catalogues apis
router.get("/catalogues", AuthMiddleware, dashboardroutes.getAllCatalogues);//get Catalogues page
router.get('/getcataloguejson', AuthMiddleware, dashboardroutes.getCataloguesJson);//get Catelogues data json
router.post("/saveCatalogue", AuthMiddleware, upload.fieldsWithSizeError([{ name: "image", maxCount: 1 }, { name: "pdf", maxCount: 1 },]),upload.validateDimensions, dashboardroutes.saveCatalogue);//add Catalogues
router.delete("/catalogue/delete/:id", AuthMiddleware, dashboardroutes.deleteCatalogue);//delete Catalogues


// Newsletter apis
router.get('/newslatter', AuthMiddleware, dashboardroutes.getAllNewsletter)//get newslatter page

router.get("/newsletter/data", AuthMiddleware, dashboardroutes.getNewsletterjson);//get newslatter data json
router.delete("/newsletter/delete/:id", AuthMiddleware, dashboardroutes.deleteNewsletter);//delete newslatter
router.post("/newsletter/bulk-delete", AuthMiddleware, dashboardroutes.bulkDelete);//bulk-delete newslatter


// contact apis
router.get("/contact", AuthMiddleware, dashboardroutes.getContact);//get contact page
router.post(
  "/contact/save",
  AuthMiddleware,
  upload.fieldsWithSizeError([
    { name: "image", maxCount: 1 },    // logo
    { name: "darkLogo", maxCount: 1 },  // dark logo
    { name: "favicon", maxCount: 1 }   // favicon
  ]),
  upload.validateDimensions,
  dashboardroutes.saveContact
);



//Faq 
router.get('/faq', dashboardroutes.getfaqpage)
router.get('/faqjson', dashboardroutes.getFAQJson)
router.post('/faqsave', dashboardroutes.saveFAQ)
router.delete('/faqdelete/:id', dashboardroutes.deleteFAQ)





// Testimonials
router.get("/testimonials", dashboardroutes.gettestinonialpage);
router.get("/testimonialjson", dashboardroutes.getTestimonials);
router.post("/testimonialsave", dashboardroutes.saveTestimonial);
router.delete("/testimonialdelete/:id", dashboardroutes.deleteTestimonial);



router.get("/getcategories", AuthMiddleware, dashboardroutes.getCategories);// get category

// Category apis
router.get('/ecocategory', AuthMiddleware, dashboardroutes.getAllCategoryEco);//get Category page
router.get("/getecocategoryjson", AuthMiddleware, dashboardroutes.getCategoryJsonEco);// get Category data json
router.post("/saveecocategory", AuthMiddleware, dashboardroutes.saveCategoryEco);// add Category
router.delete("/ecocategorydelete/:id", AuthMiddleware, dashboardroutes.deleteCategoryEco);//delete Category


//Project apis
router.get('/project', AuthMiddleware, dashboardroutes.getAllProject)// get project page
router.get("/getprojectjson", AuthMiddleware, dashboardroutes.getProjectJson);//get project data json
router.post("/saveProject", AuthMiddleware, upload.fieldsWithSizeError([{ name: "images", maxCount: 5 },{ name: "sectionImage", maxCount: 1 }]),
  upload.validateDimensions, dashboardroutes.saveProject);//add project
router.delete("/project/delete/:id", AuthMiddleware, dashboardroutes.deleteProject);//delete project



router.post("/savesection", upload.fieldsWithSizeError([
  { name: "image", maxCount: 1 },         
  { name: "pageBgBanner", maxCount: 1 }]), upload.validateDimensions,
  dashboardroutes.updateSectionByType);



router.get("/seo", dashboardroutes.getSeoPage);
router.get("/seo/:type", dashboardroutes.getSeoByType);
router.post("/seo/save", dashboardroutes.saveSeo);

router.post('/generateDescription', dashboardroutes.generateDescription);
router.post('/generateMetaAll', dashboardroutes.generateMetaAll);


//forgrtpassword
router.get('/forget-password', dashboardroutes.getForgetPassword);                          // get forgetpassword
router.post('/forget-password', dashboardroutes.postForgetPassword);                        //post forgetpassword
router.get('/reset-password/:token', dashboardroutes.getResetPassword);                     // get reset-password
router.post('/reset-password', dashboardroutes.postResetPassword);


router.get('/getSettingjson', dashboardroutes.getSettingjson);                                // get setting json

//profile page
router.get('/profile', AuthMiddleware, dashboardroutes.getprofile);
router.post('/changepassword', AuthMiddleware, dashboardroutes.changePassword);
router.put("/adminimage", AuthMiddleware, upload.singleWithSizeError("image"), dashboardroutes.updateProfileImage);


router.get('/notificationhistory', AuthMiddleware, dashboardroutes.Notificationhistory);
router.get('/latestnotification', AuthMiddleware, dashboardroutes.getnotification);
router.get('/readnotification/:id', dashboardroutes.notificationread)

//History  apis
router.get("/history", AuthMiddleware, dashboardroutes.getAllHistory);//get history page
router.get("/gethistoryjson", AuthMiddleware, dashboardroutes.getHistoryJson);//get history data json
router.post("/saveHistory", AuthMiddleware, upload.singleWithSizeError("image"), upload.validateDimensions, dashboardroutes.saveHistory);//add history
router.delete("/history/delete/:id", AuthMiddleware, dashboardroutes.deleteHistory);// delete history


router.get('/notificationhistoryjson', dashboardroutes.getNotificationJSON)

router.get('/inquiry', dashboardroutes.getInquiry);
router.get('/inquiryjson', dashboardroutes.getinquiryjson);
router.delete("/inquirydelete/:id", dashboardroutes.deleteInquiryJSON);


router.get("/whychooseus", dashboardroutes.getWhyChooseUsPage);
router.get("/whychooseusjson", dashboardroutes.getSection);
router.post("/savewhychooseus", upload.singleWithSizeError("image"), upload.validateDimensions, dashboardroutes.saveSection);


router.get("/herostats", AuthMiddleware, dashboardroutes.getHeroStats);
router.get("/herostatsjson", dashboardroutes.getHeroStatsJson);
router.post("/herostatssave", dashboardroutes.saveHeroStats);
router.delete("/herostatsdelete/:id", AuthMiddleware, dashboardroutes.deleteHeroStats);


router.get("/howitwork", dashboardroutes.getHowItWork);
router.get("/howitworkjson", dashboardroutes.getHowItWorkJson);
router.post("/howitworksave", upload.fieldsWithSizeError([
  { name: "image", maxCount: 1 },
  { name: "backgroundImage", maxCount: 1 }
]), upload.validateDimensions, dashboardroutes.saveHowItWork);
router.delete("/howitworkdelete/:id", dashboardroutes.deleteHowItWork);


router.get("/getgallery", AuthMiddleware, dashboardroutes.getAllGallery); //get gallery page
router.get("/getgalleryjson", AuthMiddleware, dashboardroutes.getAllGalleryjson);// get gallery data json
router.post("/savegallery", AuthMiddleware, upload.singleWithSizeError("image"), upload.validateDimensions, dashboardroutes.saveGallery);//add gallery
router.delete("/gallery/delete/:id", AuthMiddleware, dashboardroutes.deleteGallery);// delete gallery




router.get("/herosection", dashboardroutes.getHeroSection);
router.get("/herosectionjson", dashboardroutes.getHerosectionjson);
router.post("/herosectionsave", upload.heroSingle("image"), upload.validateDimensions, dashboardroutes.saveHeroSection);
router.delete("/herosectiondelete/:id", dashboardroutes.deleteHeroSection);


router.get('/cta', dashboardroutes.getCtaSection);
router.post("/savecta", upload.singleWithSizeError("image"), upload.validateDimensions, dashboardroutes.updateCtaByType);


router.get('/getsectionsetting', dashboardroutes.getSectionSettings);
router.post("/sectionsettings/save", dashboardroutes.saveSectionSettings);

// contact page 
router.get('/contactuspage',dashboardroutes.getContactuspage)


//Export data base
router.get('/exportdatabase',dashboardroutes.getExportdatabase)
router.get("/exportdatabasezip", dashboardroutes.exportDatabase);

// api key serring

router.get("/getapikeysetting",dashboardroutes.getapikeysetting)
router.post("/Apikeysettingupdate", dashboardroutes.updateApikeySettings);

module.exports = router;
