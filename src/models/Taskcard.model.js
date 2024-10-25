import mongoose, { Schema } from "mongoose";

const taskcardSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board", 
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Todo", "Inprogress", "Completed"], 
      default: "Todo",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const TaskCard = mongoose.model("TaskCard", taskcardSchema);
