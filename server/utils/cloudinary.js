import { v2 as Cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

Cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadMedia = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  try {
    const response = await Cloudinary.uploader.upload(file, {
      resource_type: "auto",
      folder: "lms",
    });
    console.log("Media Uploaded successfully", response.secure_url);
    return response;
  } catch (error) {
    console.error("Error uploading file: " + error.message);
  } finally {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
      console.log("Temporary file deleted successfully");
    } catch (error) {
      console.error("Error deleting temporary file: " + error.message);
    }
  }
};

export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await Cloudinary.uploader.destroy(publicId);
    console.log("Media deleted from Cloudinary successfully");
  } catch (error) {
    console.error("Error deleting media from Cloudinary: " + error.message);
  }
};

export const deleteVedioFromCloudinary = async (publicId) => {
  try {
    await Cloudinary.uploader.destroy(publicId, { resource_type: "Vedio" });
    console.log("Video deleted from Cloudinary successfully");
  } catch (error) {
    console.error("Error deleting media from Cloudinary: " + error.message);
  }
};
