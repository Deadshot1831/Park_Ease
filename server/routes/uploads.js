const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
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

router.post('/', protect, upload.array('images', 6), uploadImages);

module.exports = router;
