import mongoose, { Schema } from "mongoose";

const boardSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,  
    },
    description: {
      type: String,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "TaskCard",  
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Board = mongoose.model("Board", boardSchema);
