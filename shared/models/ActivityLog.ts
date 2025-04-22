import mongoose, { Schema, Document } from "mongoose";

export interface IChange {
  field: string;
  old: any;
  new: any;
}

export enum Action {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export interface IActivityLog extends Document {
  tableName: string;
  targetId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  changes: IChange[];
  createdBy: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema({
  tableName: {
    type: String,
    required: true,
  },
  targetId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: [...Object.values(Action)],
    required: true,
  },
  changes: [
    {
      field: {
        type: String,
        required: true,
      },
      old: {
        type: Schema.Types.Mixed,
      },
      new: {
        type: Schema.Types.Mixed,
      },
    },
  ],
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const validateAndGetChanges = (
  oldData: any,
  newData: any,
): IChange[] => {
  const changes: IChange[] = [];

  Object.keys(newData).forEach((key) => {
    if (JSON.stringify(oldData[key]) != JSON.stringify(newData[key])) {
      changes.push({
        field: key,
        old: oldData[key],
        new: newData[key],
      });
    }
  });

  return changes;
};

export const createActivityLog = async (
  tableName: string,
  targetId: unknown,
  action: string,
  changes: IChange[],
  createdBy: string,
) => {
  const activityLog = new ActivityLog({
    tableName,
    targetId,
    action,
    changes,
    createdBy,
  });

  await activityLog.save();
};

export const ActivityLog = mongoose.model<IActivityLog>(
  "ActivityLog",
  ActivityLogSchema,
);
