import RazorPay from "razorpay";

import { Course } from "../models/course.model.js";
import { coursePurchase } from "../models/coursePurchase.model.js";
import { AsyncHandler } from "../middlewares/error.middlewares.js";
import crypto from "crypto";

const instance = new RazorPay({
  key_id: "your_razorpay_key_id",
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

export const createRazorPayOrder = AsyncHandler(async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }
    const newPurchase = new coursePurchase({
      user: userId,
      course: courseId,
      amount: course.price,
      status: "pending",
    });

    const options = {
      amount: course.price * 100, // amount in paise
      currency: "INR",
      receipt: `course-${courseId}`,
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };

    const order = await instance.orders.create(options);

    console.log(order);

    newPurchase.paymentId = order.id;
    await newPurchase.save();

    res.status(200).json({
      data: order,
      success: true,
      message: "Payment took place successfully",
    });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

export const verifyPayment = AsyncHandler(async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;
    if (!isAuthentic) {
      throw new Error("Payment signature does not match");
    }

    const purchase = await coursePurchase.findOne({
      paymentId: razorpay_order_id,
    });

    if (!purchase) {
      throw new Error("Purchase record not found");
    }
    purchase.status = "completed";
    await purchase.save();

    res.status(200).json({
      data: purchase,
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});
