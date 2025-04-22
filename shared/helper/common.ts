import fs from "fs";
import Mail from "../models/Mail";

const addMail = async (mailDetail: any) => {
  try {
    await Mail.create(mailDetail);
  } catch (error) {
    console.log("error", error);
  }
};

const readHTMLFile = function (path: any, cb: any) {
  // read file
  fs.readFile(path, "utf-8", function (err, data) {
    if (err) {
      console.log(err);
      throw err;
    } else {
      cb(null, data);
    }
  });
};

export { addMail, readHTMLFile };
