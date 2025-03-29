import mongoose from "mongoose";
const lectureProgressSchema = new mongoose.Schema({
    lecture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
        required: [true, "Lecture references is required"],
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    watchTime: {
        type: Number,
        default: 0,
    },
    lastWatched: {
        type: Date,
        default: Date.now,
    },
});
const courseProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User references is required"],
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Course references is required"],
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    completionPercentage: {
        type: Number,
        default: 0,
        max: [100, "completion percentage max value is 100"],
        min: [0, "completion percentage min value is 0"],
    },
    lectureProgress: [lectureProgressSchema],
    lastAccessed: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// calculate course completion
courseProgressSchema.pre("save", function (next) {
    if (this.lectureProgress.length > 0) {
        const completedLectures = this.lectureProgress.filter((lp) => lp.isCompleted).length;
        this.completionPercentage = Math.round((completedLectures / this.lectureProgress.length) * 100);
        this.isCompleted = this.completionPercentage === 100;
    }
    next();
});
// update last accessesed
courseProgressSchema.methods.updateLastAccessed = function () {
    this.lastAccessed = Date.now();
    return this.save({ validateBeforeSave: true });
};
export const courseProgress = mongoose.model("CourseProgress", courseProgressSchema);
