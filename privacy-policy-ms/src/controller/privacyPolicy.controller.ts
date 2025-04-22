import PrivacyPolicy, { IPrivacyPolicy } from "../models/privacyPolicy";
import { StatusCodes } from "http-status-codes";

// Create a new privacy policy
export const createPrivacyPolicy = async (req: any, res: any) => {
  try {
    const { version, title, sections, isActive }: IPrivacyPolicy = req.body;

    // Check if version already exists
    const existingPolicy = await PrivacyPolicy.findOne({ version });
    if (existingPolicy) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("PRIVACY_POLICY_VERSION_EXISTS"),
      });
    }

    // Create new privacy policy
    const privacyPolicy = new PrivacyPolicy({
      version,
      title,
      sections,
      isActive,
    });

    await privacyPolicy.save();

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: req.__("PRIVACY_POLICY_CREATED_SUCCESS"),
      data: privacyPolicy,
    });
  } catch (error) {
    console.error("Error creating privacy policy:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};

// Get the latest active privacy policy
export const getActivePrivacyPolicy = async (req: any, res: any) => {
  try {
    const privacyPolicy = await PrivacyPolicy.findOne({ isActive: true }).sort({
      createdAt: -1,
    });

    if (!privacyPolicy) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("PRIVACY_POLICY_NOT_FOUND"),
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("PRIVACY_POLICY_FETCH_SUCCESS"),
      data: privacyPolicy,
    });
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};

// Get a specific version of privacy policy
export const getPrivacyPolicyByVersion = async (req: any, res: any) => {
  try {
    const { version } = req.params;

    const privacyPolicy = await PrivacyPolicy.findOne({ version });

    if (!privacyPolicy) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("PRIVACY_POLICY_NOT_FOUND"),
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("PRIVACY_POLICY_FETCH_SUCCESS"),
      data: privacyPolicy,
    });
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};

// Get all privacy policies with pagination
export const getAllPrivacyPolicies = async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const policies = await PrivacyPolicy.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PrivacyPolicy.countDocuments();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("PRIVACY_POLICY_FETCH_ALL_SUCCESS"),
      data: {
        policies,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching privacy policies:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};

// Update a privacy policy
export const updatePrivacyPolicy = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const privacyPolicy = await PrivacyPolicy.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    if (!privacyPolicy) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("PRIVACY_POLICY_NOT_FOUND"),
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("PRIVACY_POLICY_UPDATED_SUCCESS"),
      data: privacyPolicy,
    });
  } catch (error) {
    console.error("Error updating privacy policy:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};

// Delete a privacy policy
export const deletePrivacyPolicy = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const privacyPolicy = await PrivacyPolicy.findByIdAndDelete(id);

    if (!privacyPolicy) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("PRIVACY_POLICY_NOT_FOUND"),
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("PRIVACY_POLICY_DELETED_SUCCESS"),
    });
  } catch (error) {
    console.error("Error deleting privacy policy:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};
