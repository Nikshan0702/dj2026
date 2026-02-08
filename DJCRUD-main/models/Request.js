import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    song: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    status: {
      type: String,
      default: "pending",
      trim: true,
    },
  },
  { timestamps: true },
);

// Common query patterns:
// - Admin list: sort by newest (createdAt desc)
// - Optional future server-side filters by name/song
RequestSchema.index({ createdAt: -1 });
RequestSchema.index({ name: 1 });
RequestSchema.index({ song: 1 });

export default mongoose.models.Request ||
  mongoose.model("Request", RequestSchema);
