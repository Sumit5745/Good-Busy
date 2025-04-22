import mongoose, { Schema, Document } from "mongoose";

export enum FileType {
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
  AUDIO = "audio",
  PDF = "pdf",
  OTHER = "other",
}

export enum FIleStatus {
  ACTIVE = "active",
  DELETED = "deleted",
}

export interface IFile extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  size: number;
  fileType: string;
  ext: string;
  location: string;
  type: FileType;
  createdAt: Date;
  updatedAt: Date;
  status: FIleStatus;
  isChat: boolean;
}

const fileSchema = new Schema<IFile>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      trim: true,
    },
    ext: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(FileType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FIleStatus),
      default: FIleStatus.ACTIVE,
    },
    isChat: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
fileSchema.index({ type: 1 });
fileSchema.index({ fileType: 1 });
fileSchema.index({ createdAt: -1 });

const File = mongoose.model<IFile>("File", fileSchema);

export default File;
