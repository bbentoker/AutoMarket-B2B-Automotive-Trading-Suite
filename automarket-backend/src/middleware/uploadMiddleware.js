const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 10MB limit
    files: 80, // Maximum 80 files (30 listing images + 50 damaged part images)
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

module.exports = upload;
