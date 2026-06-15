const { asyncHandler } = require('../middleware/errorHandler');
const { uploadImage } = require('../config/cloudinary');

// @route   POST /api/uploads  (multipart, field: "images")
// Uploads to Cloudinary when configured; otherwise echoes back data URLs so the
// UI keeps working in local development without credentials.
const uploadImages = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (files.length === 0) {
    res.status(400);
    throw new Error('No files uploaded');
  }

  const results = [];
  for (const file of files) {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const uploaded = await uploadImage(dataUri, 'parkease/spots');
    results.push(uploaded || { url: dataUri, publicId: null });
  }

  res.status(201).json({ success: true, images: results });
});

module.exports = { uploadImages };
