import mongoose, { Document, Types } from "mongoose";

export interface ICoursePurchase extends Document {
  course: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  paymentId: string;
  paymentDate: Date;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  metadata?: Map<string, string>;
  isRefundable: boolean;
  processRefund(reason: string, amount?: number): Promise<ICoursePurchase>;
  createdAt: Date;
  updatedAt: Date;
}

const coursePurchaseSchema = new mongoose.Schema<ICoursePurchase>(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course references is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User references is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount should be greater than or equal to 0"],
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      uppercase: true,
      default: "USD",
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["pending", "failed", "completed", "refunded"],
        message: "Please enter a valid status",
      },
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
    },
    paymentId: {
      type: String,
      required: [true, "Payment ID is required"],
    },
    refundId: {
      type: String,
    },
    refundAmount: {
      type: Number,
      min: [0, "Refund amount must be non-negative"],
    },
    refundReason: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

coursePurchaseSchema.index({ user: 1, course: 1 });
coursePurchaseSchema.index({ status: 1 });
coursePurchaseSchema.index({ createdAt: -1 });

coursePurchaseSchema.virtual("isRefundable").get(function (): boolean {
  if (this.status !== "completed") return false;
  const thirtyDayPeriod = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.createdAt > thirtyDayPeriod;
});

// method to process refund
coursePurchaseSchema.methods.processRefund = async function (reason: string, amount: number) {
  this.reason = reason;
  this.status = "refunded";
  this.refundAmount = amount || this.amount;

  return this.save();
};

export const coursePurchase = mongoose.model<ICoursePurchase>(
  "CoursePurchase",
  coursePurchaseSchema
);
