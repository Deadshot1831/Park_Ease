const cloudinary = require('cloudinary').v2;

let configured = false;

const getCloudinary = () => {
  if (configured) return cloudinary;
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return null;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  configured = true;
  return cloudinary;
};

// Uploads a data URI / file path. Returns { url, publicId } or null if unconfigured.
const uploadImage = async (file, folder = 'parkease') => {
  const cl = getCloudinary();
  if (!cl) return null;
  const result = await cl.uploader.upload(file, { folder });
  return { url: result.secure_url, publicId: result.public_id };
};

const deleteImage = async (publicId) => {
  const cl = getCloudinary();
  if (!cl || !publicId) return null;
  return cl.uploader.destroy(publicId);
};

module.exports = { getCloudinary, uploadImage, deleteImage };
