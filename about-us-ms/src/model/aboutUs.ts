import mongoose from "mongoose";

export interface IAboutUsSection {
  title: string;
  content: string;
}

export interface IAboutUs {
  version: string;
  title: string;
  sections: IAboutUsSection[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const aboutUsSectionSchema = new mongoose.Schema<IAboutUsSection>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
});

const aboutUsSchema = new mongoose.Schema<IAboutUs>(
  {
    version: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sections: [aboutUsSectionSchema],
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Only one about us page can be active at a time
aboutUsSchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.model("AboutUs").updateMany(
      { _id: { $ne: this._id } },
      { isActive: false },
    );
  }
  next();
});

const AboutUs = mongoose.model<IAboutUs>("AboutUs", aboutUsSchema);

export default AboutUs;
