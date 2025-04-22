import { isCelebrateError } from "celebrate";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";

const HandleErrorMessage = async (
  err: any,
  _req: any,
  res: Response,
  _next: any,
): Promise<any> => {
  try {
    if (isCelebrateError(err)) {
      let errorBody: any = {};
      if (err.details.get("body")) {
        errorBody = err.details.get("body");
      } else if (err.details.get("query")) {
        errorBody = err.details.get("query");
      } else if (err.details.get("headers")) {
        errorBody = err.details.get("headers");
      }

      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ status: false, message: errorBody.details[0].message });
    }
  } catch (e: any) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ status: false, message: e.message });
  }
};

export default HandleErrorMessage;
