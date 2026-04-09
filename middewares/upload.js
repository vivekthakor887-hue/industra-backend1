const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// --- Base upload folder ---
const baseDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

// --- Folder-specific dimensions ---
const folderSizes = {
  about: {
    image: { width: 460, height: 360, tolerance: 20 },   // main about image
    imagesecond: { width: 420, height: 500, tolerance: 20 },   // second about image
  }, blog: { width: 460, height: 360, tolerance: 10 },
  history: { width: 192, height: 192, tolerance: 20 },
  exhibition: { width: 800, height: 600, tolerance: 20 },
  project:
  {
    image: { width: 554, height: 500, tolerance: 10 },   // thumb image
    sectionImage: { width: 1460, height: 420, tolerance: 20 },   // main image
  },
  catalogue: null,
  service: { width: 1000, height: 1143, tolerance: 10 },
  logo: {
    logo: { width: 330, height: 69, tolerance: 20 },
    favicon: { width: 83, height: 83, tolerance: 12 } // 32 & 64 allowed
  },
  whychooseus: { width: 624, height: 600, tolerance: 20 },
  howitwork: {
    image: { width: 624, height: 700, tolerance: 20 },
    backgroundImage: { width: 1920, height: 850, tolerance: 30 },
  },
  gallery: { width: 680, height: 360, tolerance: 20 },
  hero: { width: 1920, height: 850, tolerance: 20 },
  cta: { width: 448, height: 297, tolerance: 20 },
  section: {
    image: { width: 1920, height: 850, tolerance: 20 },
    pageBgBanner: { width: 1900, height: 440, tolerance: 20 }
  }
};

// --- Helper to map route to folder ---
const getFolderFromRoute = (req) => {
  const route = req.originalUrl.toLowerCase();
  if (route.includes("adminimage") || route.includes("adminprofile"))
    return "adminprofile";
  if (route.includes("about")) return "about";
  if (route.includes("blog")) return "blog";
  if (route.includes("history")) return "history";
  if (route.includes("exhibition")) return "exhibition";
  if (route.includes("project")) return "project";
  if (route.includes("catalogue")) return "catalogue";
  if (route.includes("service")) return "service";
  if (route.includes("contact") || route.includes("logo")) return "logo";
  if (route.includes("whychooseus")) return "whychooseus";
  if (route.includes("howitwork")) return "howitwork";
  if (route.includes("gallery")) return "gallery";
  if (route.includes("hero")) return "hero";
  if (route.includes("cta")) return "cta";
  if (route.includes("section")) return "section";

  return "others";
};

// --- Multer storage ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = getFolderFromRoute(req);
    const folderPath = path.join(baseDir, folderName);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// --- File Filter ---
const fileFilter = (req, file, cb) => {
  const folderName = getFolderFromRoute(req);
  let allowed = /jpeg|jpg|png|webp/;

  if (folderName === "about" && file.fieldname === "video") {
    allowed = /mp4|webm|ogg/; // ADD
  }

  if (folderName === "hero") {
    allowed = /jpeg|jpg|png|webp|mp4|webm|ogg/;
  }
 if (folderName === "logo") {
    allowed = /jpeg|jpg|png|webp|ico/;
  }

  if (folderName === "catalogue" || folderName === "tickets") {
    allowed = /jpeg|jpg|png|webp|pdf/;
  }
  const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowed.test(file.mimetype);
  if (extValid && mimeValid) return cb(null, true);
  cb(new Error("Only image or PDF files allowed"));
};

// --- Multer instance ---
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const heroUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});
const aboutupload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

// --- Image Dimension Validator ---
const validateDimensions = async (req, res, next) => {
  const folderName = getFolderFromRoute(req);
  if (!folderSizes[folderName]) return next();

  const files = [];
  if (req.file) files.push(req.file);
  if (req.files) Object.values(req.files).flat().forEach(f => files.push(f));
  if (!files.length) return next();

  try {
    for (const f of files) {
      if (!f.mimetype.startsWith("image/")) continue;
      if (path.extname(f.originalname) === ".ico") continue;

      let dim = null;

      if (folderName === "about") {

        dim = folderSizes.about[f.fieldname];
      } else if (folderName === "logo") {

        dim = f.fieldname === "favicon" ? folderSizes.logo.favicon : folderSizes.logo.logo;
      } else if (folderName === "howitwork") {
        dim = folderSizes.howitwork[f.fieldname];
      }
      else if (folderName === "section") {
        dim = folderSizes.section[f.fieldname];
      }
      else if (folderName === "project") {
        dim = folderSizes.project[f.fieldname];
      }

      else {

        dim = folderSizes[folderName];
      }

      if (!dim) continue;

      const { width, height } = await sharp(f.path).metadata();

      const validWidth = width >= dim.width - dim.tolerance && width <= dim.width + dim.tolerance;
      const validHeight = height >= dim.height - dim.tolerance && height <= dim.height + dim.tolerance;

      if (!validWidth || !validHeight) {
        fs.unlink(f.path, () => { });
        return res.status(200).json({
          success: false,
          message: `Invalid size for ${f.fieldname}. Required approx ${dim.width}x${dim.height}px`,
        });
      }

    }
    next();
  } catch (err) {
    files.forEach(f => {
      if (fs.existsSync(f.path)) {
        fs.unlink(f.path, () => { });
      }
    });

    return res.status(500).json({ success: false, message: "Error processing image" });
  }
};


// --- Thumbnail Generator for blogs ---
const generateThumbnail = async (req, res, next) => {
  if (!req.file) return next();
  const folderName = getFolderFromRoute(req);
  if (folderName !== "blog") return next();

  const thumbDir = path.join(baseDir, "blog/thumb");
  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

  const thumbFilename = "thumb_" + req.file.filename;
  const thumbPath = path.join(thumbDir, thumbFilename);

  try {
    await sharp(req.file.path)
      .resize(420, 300)
      .toFile(thumbPath);

    req.thumbnailPath = "/uploads/blog/thumb/" + thumbFilename;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Thumbnail creation failed" });
  }
};



// Friendly size error handling
upload.singleWithSizeError = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(200).json({ success: false, message: "File must be under 5 MB" });
      }
      return res.status(200).json({ success: false, message: err.message });
    }
    next();
  });
};

upload.fieldsWithSizeError = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, function (err) {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(200).json({
            success: false,
            message: "File must be under 5 MB"
          });
        }
        return res.status(200).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

aboutupload.fieldsWithSizeError = (fields) => (req, res, next) => {
  aboutupload.fields(fields)(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(200).json({
          success: false,
          message: "Image max 5MB aur Video max 50MB allowed"
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(200).json({
          success: false,
          message: "Unexpected file field"
        });
      }
      return res.status(200).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

const heroSingle = (field) => (req, res, next) => {
  heroUpload.single(field)(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(200).json({
          success: false,
          message: "Video max 50MB | Image max 5MB",
        });
      }
      return res.status(200).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

// --- Export ---
upload.validateDimensions = validateDimensions;
upload.generateThumbnail = generateThumbnail;
upload.aboutupload = aboutupload;
upload.heroSingle = heroSingle;
module.exports = upload;
