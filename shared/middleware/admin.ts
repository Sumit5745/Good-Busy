import { StatusCodes } from "http-status-codes";
export const adminAccess = async (req: any, res: any, next: any) => {
  if (req.user.role !== "admin") {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ status: false, message: res.__("FORBIDDEN") });
  }
  next();
};
