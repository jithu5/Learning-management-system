import mongoose, { Document } from "mongoose";

export interface ILecture extends Document {
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  publicId: string;
  isPreview: boolean;
  order: number;
}

const lectureSchema = new mongoose.Schema<ILecture>(
  {
    title: {
      type: String,
      required: [true, "Lecture Title is required"],
      maxLength: [100, "Lecture Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Lecture Description is required"],
      trim: true,
      maxLength: [500, "Lecture Description cannot exceed 500 characters"],
    },
    videoUrl: {
      type: String,
      required: [true, "Lecture Video URL is required"],
    },
    duration: {
      type: Number,
      default: 0,
    },
    publicId: {
      type: String,
      required: [true, "publicId is required"],
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: [true, "Lecture Order is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

lectureSchema.pre<ILecture>('save', function(next) {
  if (this.duration) {
    this.duration = Math.round(this.duration * 100) / 100;
    // optional thing
  }
  next();
});

export const Lecture = mongoose.model<ILecture>("Lecture", lectureSchema);
