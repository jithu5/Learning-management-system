import mongoose, { Document, Types } from "mongoose";

// Define an interface for the Course document
export interface ICourse extends Document {
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  thumbnail: string;
  enrolledStudents: Types.ObjectId[];
  lectures: Types.ObjectId[];
  instructor: Types.ObjectId;
  isPublished: boolean;
  totalDuration: number;
  totalLectures: number;
  averageRating?: number;
}

const courseSchema = new mongoose.Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxLength: [100, "Course title cannot exceed 100 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxLength: [200, "Sub-title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      maxLength: [5000, "Course description cannot exceed 5000 characters"],
    },
    category: {
      type: String,
      required: [true, "Course category is required"],
      trim: true,
    },
    level: {
      type: String,
      enum: {
        values: ["Beginner", "Intermediate", "Advanced"],
        message: "Invalid course level specified",
      },
      trim: true,
      default: "Beginner",
    },
    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Course price must be a positive number"],
    },
    thumbnail: {
      type: String,
      required: [true, "Course thumbnail is required"],
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Course instructor is required"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    totalLectures: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.pre<ICourse>("save", async function (next) {
  if (this.lectures) {
    this.totalLectures = this.lectures.length;
  }
  next();
});

courseSchema.virtual("averageRating").get(function () {
  return 0; // TODO
});

export const Course = mongoose.model<ICourse>("Course", courseSchema);
