const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const { uploadImages } = require('../controllers/uploadController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Listing photos are the only thing uploaded today, so this is owner-only —
// any signed-up account could otherwise push 30 MB a request into Cloudinary.
// Loosen it (to `protect`) if drivers ever attach photos to reviews.
router.post('/', protect, authorize('owner', 'admin'), upload.array('images', 6), uploadImages);

module.exports = router;
