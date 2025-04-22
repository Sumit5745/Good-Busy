import mongoose from "mongoose";

export interface IPrivacyPolicySection {
  title: string;
  content: string;
}

export interface IPrivacyPolicy {
  version: string;
  title: string;
  sections: IPrivacyPolicySection[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const privacyPolicySectionSchema = new mongoose.Schema<IPrivacyPolicySection>({
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

const privacyPolicySchema = new mongoose.Schema<IPrivacyPolicy>(
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
    sections: [privacyPolicySectionSchema],
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Only one policy can be active at a time
privacyPolicySchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.model("PrivacyPolicy").updateMany(
      { _id: { $ne: this._id } },
      { isActive: false },
    );
  }
  next();
});

const PrivacyPolicy = mongoose.model<IPrivacyPolicy>(
  "PrivacyPolicy",
  privacyPolicySchema,
);

export default PrivacyPolicy;
