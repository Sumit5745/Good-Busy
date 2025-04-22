import mongoose from "mongoose";

export interface ITermsConditionSection {
  title: string;
  content: string;
}

export interface ITermsCondition {
  version: string;
  title: string;
  sections: ITermsConditionSection[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const termsConditionSectionSchema = new mongoose.Schema<ITermsConditionSection>(
  {
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
  },
);

const termsConditionSchema = new mongoose.Schema<ITermsCondition>(
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
    sections: [termsConditionSectionSchema],
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Only one terms and conditions document can be active at a time
termsConditionSchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.model("TermsCondition").updateMany(
      { _id: { $ne: this._id } },
      { isActive: false },
    );
  }
  next();
});

const TermsCondition = mongoose.model<ITermsCondition>(
  "TermsCondition",
  termsConditionSchema,
);

export default TermsCondition;
