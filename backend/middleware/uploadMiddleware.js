const multer = require('multer');

/**
 * Configure Multer Memory Storage
 * Holding the uploaded file in memory as a buffer allows us to stream
 * it directly to Cloudinary without cluttering local disk storage.
 */
const storage = multer.memoryStorage();

/**
 * Validate that uploaded files are images only
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP) are supported!'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes max file size
  },
  fileFilter,
});

module.exports = upload;
