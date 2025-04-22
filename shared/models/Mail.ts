import mongoose, { Schema, Document } from "mongoose";

export interface IMail extends Document {
  mailFrom: string;
  mailTo: string;
  mailBody: string;
  mailAttachment: string;
  mailSubject: string;
  mailStatus: string;
  mailResponse: string;
  createdBy: number;
  updatedBy: number;
}

export enum mailStatus {
  SENT = "sent",
  FAILED = "failed",
  PENDING = "pending",
}

const mailSchema = new Schema(
  {
    mailFrom: { type: String, required: true },
    mailTo: { type: String, required: true },
    mailBody: { type: String, required: true },
    mailAttachment: { type: String },
    mailSubject: { type: String, required: true },
    mailStatus: {
      type: String,
      enum: Object.values(mailStatus),
      default: mailStatus.PENDING,
    },
    mailResponse: { type: String },
    createdBy: { type: Number },
    updatedBy: { type: Number },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IMail>("Mails", mailSchema);
