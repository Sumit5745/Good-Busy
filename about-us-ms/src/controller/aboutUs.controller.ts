import AboutUs, { IAboutUs } from "../model/aboutUs";
import mongoose from "mongoose";
import logger from "../../../shared/services/logger.service";

// Create a new About Us page
export const createAboutUs = async (req: any, res: any) => {
  try {
    const aboutUsData: IAboutUs = req.body;

    // Check if version already exists
    const existingVersion = await AboutUs.findOne({
      version: aboutUsData.version,
    });

    if (existingVersion) {
      return res.status(400).json({
        success: false,
        message: res.__("ABOUT_US_VERSION_EXISTS"),
      });
    }

    // If isActive is true, set all other documents to false
    if (aboutUsData.isActive) {
      await AboutUs.updateMany({}, { isActive: false });
    }

    const aboutUs = new AboutUs(aboutUsData);
    await aboutUs.save();

    logger.info("About Us created successfully", {
      service: "about-us-ms",
      aboutUsId: aboutUs._id.toString(),
    });

    return res.status(201).json({
      success: true,
      data: aboutUs,
      message: res.__("ABOUT_US_CREATED"),
    });
  } catch (error: any) {
    logger.error(`Error creating About Us: ${error.message}`, {
      service: "about-us-ms",
      error,
    });

    return res.status(500).json({
      success: false,
      message: res.__("INTERNAL_SERVER_ERROR"),
    });
  }
};

// Get the currently active About Us page
export const getActiveAboutUs = async (req: any, res: any) => {
  try {
    const aboutUs = await AboutUs.findOne({ isActive: true });

    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: res.__("ABOUT_US_NOT_FOUND"),
      });
    }

    return res.status(200).json({
      success: true,
      data: aboutUs,
    });
  } catch (error: any) {
    logger.error(`Error fetching active About Us: ${error.message}`, {
      service: "about-us-ms",
      error,
    });

    return res.status(500).json({
      success: false,
      message: res.__("INTERNAL_SERVER_ERROR"),
    });
  }
};

// Get About Us by version
export const getAboutUsByVersion = async (req: any, res: any) => {
  try {
    const { version } = req.params;
    const aboutUs = await AboutUs.findOne({ version });

    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: res.__("ABOUT_US_NOT_FOUND"),
      });
    }

    return res.status(200).json({
      success: true,
      data: aboutUs,
    });
  } catch (error: any) {
    logger.error(`Error fetching About Us by version: ${error.message}`, {
      service: "about-us-ms",
      error,
      version: req.params.version,
    });

    return res.status(500).json({
      success: false,
      message: res.__("INTERNAL_SERVER_ERROR"),
    });
  }
};

// Get all About Us pages (admin)
export const getAllAboutUs = async (req: any, res: any) => {
  try {
    const aboutUsList = await AboutUs.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: aboutUsList,
    });
  } catch (error: any) {
    logger.error(`Error fetching all About Us pages: ${error.message}`, {
      service: "about-us-ms",
      error,
    });

    return res.status(500).json({
      success: false,
      message: res.__("INTERNAL_SERVER_ERROR"),
    });
  }
};

// Update an About Us page
export const updateAboutUs = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: res.__("INVALID_ID"),
      });
    }

    // Find the About Us page
    const aboutUs = await AboutUs.findById(id);
    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: res.__("ABOUT_US_NOT_FOUND"),
      });
    }

    // If isActive is set to true, deactivate all other versions
    if (updateData.isActive) {
      await AboutUs.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    // Update the About Us page
    const updatedAboutUs = await AboutUs.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    logger.info("About Us updated successfully", {
      service: "about-us-ms",
      aboutUsId: id,
    });

    return res.status(200).json({
      success: true,
      data: updatedAboutUs,
      message: res.__("ABOUT_US_UPDATED"),
    });
  } catch (error: any) {
    logger.error(`Error updating About Us: ${error.message}`, {
      service: "about-us-ms",
      error,
      aboutUsId: req.params.id,
    });

    return res.status(500).json({
      success: false,
      message: res.__("INTERNAL_SERVER_ERROR"),
    });
  }
};

// Delete an About Us page
export const deleteAboutUs = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: res.__("INVALID_ID"),
      });
    }

    // Find the About Us page
    const aboutUs = await AboutUs.findById(id);
    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        message: res.__("ABOUT_US_NOT_FOUND"),
      });
    }

    // Check if this is the active version
    if (aboutUs.isActive) {
      return res.status(400).json({
        success: false,
        message: res.__("CANNOT_DELETE_ACTIVE_ABOUT_US"),
      });
    }

    // Delete the About Us page
    await AboutUs.findByIdAndDelete(id);

    logger.info("About Us deleted successfully", {
      service: "about-us-ms",
      aboutUsId: id,
    });

    return res.status(200).json({
      success: true,
      message: res.__("ABOUT_US_DELETED"),
    });
  } catch (error: any) {
    logger.error(`Error deleting About Us: ${error.message}`, {
      service: "about-us-ms",
      error,
      aboutUsId: req.params.id,
    });

    return res.status(500).json({
      success: false,
      message: res.__("INTERNAL_SERVER_ERROR"),
    });
  }
};
