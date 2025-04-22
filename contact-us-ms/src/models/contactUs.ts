import mongoose from "mongoose";

export interface IContactUs {
  username: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const contactUsSchema = new mongoose.Schema<IContactUs>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const ContactUs = mongoose.model<IContactUs>("ContactUs", contactUsSchema);

export default ContactUs;
