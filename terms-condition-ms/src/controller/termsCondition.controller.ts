import TermsCondition, { ITermsCondition } from "../models/termsCondition";
import { StatusCodes } from "http-status-codes";

// Create a new terms and conditions
export const createTermsCondition = async (req: any, res: any) => {
  try {
    const { version, title, sections, isActive }: ITermsCondition = req.body;

    // Check if version already exists
    const existingTerms = await TermsCondition.findOne({ version });
    if (existingTerms) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: req.__("TERMS_CONDITION_VERSION_EXISTS"),
      });
    }

    // Create new terms and conditions
    const termsCondition = new TermsCondition({
      version,
      title,
      sections,
      isActive,
    });

    await termsCondition.save();

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: req.__("TERMS_CONDITION_CREATED_SUCCESS"),
      data: termsCondition,
    });
  } catch (error) {
    console.error("Error creating terms and conditions:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};

// Get the latest active terms and conditions
export const getActiveTermsCondition = async (req: any, res: any) => {
  try {
    const termsCondition = await TermsCondition.findOne({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    if (!termsCondition) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("TERMS_CONDITION_NOT_FOUND"),
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("TERMS_CONDITION_FETCH_SUCCESS"),
      data: termsCondition,
    });
  } catch (error) {
    console.error("Error fetching terms and conditions:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};

// Get a specific version of terms and conditions
export const getTermsConditionByVersion = async (req: any, res: any) => {
  try {
    const { version } = req.params;

    const termsCondition = await TermsCondition.findOne({ version });

    if (!termsCondition) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("TERMS_CONDITION_NOT_FOUND"),
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("TERMS_CONDITION_FETCH_SUCCESS"),
      data: termsCondition,
    });
  } catch (error) {
    console.error("Error fetching terms and conditions:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};

// Get all terms and conditions with pagination
export const getAllTermsConditions = async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const terms = await TermsCondition.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TermsCondition.countDocuments();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("TERMS_CONDITION_FETCH_ALL_SUCCESS"),
      data: {
        terms,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching terms and conditions:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};

// Update terms and conditions
export const updateTermsCondition = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const termsCondition = await TermsCondition.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    if (!termsCondition) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("TERMS_CONDITION_NOT_FOUND"),
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("TERMS_CONDITION_UPDATED_SUCCESS"),
      data: termsCondition,
    });
  } catch (error) {
    console.error("Error updating terms and conditions:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};

// Delete terms and conditions
export const deleteTermsCondition = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const termsCondition = await TermsCondition.findByIdAndDelete(id);

    if (!termsCondition) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: req.__("TERMS_CONDITION_NOT_FOUND"),
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: req.__("TERMS_CONDITION_DELETED_SUCCESS"),
    });
  } catch (error) {
    console.error("Error deleting terms and conditions:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: req.__("SOMETHING_WENT_WRONG"),
    });
  }
};
