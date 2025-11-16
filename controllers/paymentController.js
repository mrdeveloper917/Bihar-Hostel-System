import crypto from "crypto";
import PDFDocument from "pdfkit";
import { razorpay } from "../config/razorpay.js";
import Student from "../models/student.js";
import dotenv from "dotenv";
dotenv.config();

const FIXED_FEE = Number(process.env.FEE_AMOUNT) || 5000;

export const createOrder = async (req, res) => {
  try {
    // allow frontend to send amount; otherwise use fixed fee
    const amount = Number(req.body.amount) || FIXED_FEE;

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({ orderId: order.id, key: process.env.RAZORPAY_KEY_ID, amount });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, amount } = req.body;
    const studentId = req.session.user._id;

    // verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const student = await Student.findOne({ user: studentId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const paidAmount = Number(amount) || FIXED_FEE;

    // Update student record
    student.feeStatus = "Paid";
    student.totalFeesPaid = (student.totalFeesPaid || 0) + paidAmount;
    student.payments.push({
      paymentId,
      amount: paidAmount,
      method: "Razorpay",
      status: "Success",
      date: new Date(),
    });

    await student.save();

    res.json({ success: true, message: "Payment verified successfully!", paymentId });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
};

// Download PDF Receipt
export const downloadReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const student = await Student.findOne({ "payments.paymentId": paymentId }).populate("user");
    if (!student) return res.status(404).send("Receipt not found");

    const payment = student.payments.find((p) => p.paymentId === paymentId);
    if (!payment) return res.status(404).send("Payment not found");

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt_${paymentId}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).text("Hostel Fee Receipt", { align: "center" });
    doc.moveDown(1);

    // Body
    const studentName = student.user?.name || "Student";
    const studentEmail = student.user?.email || "N/A";

    doc.fontSize(12).text(`Student Name: ${studentName}`);
    doc.text(`Email: ${studentEmail}`);
    doc.text(`Room Number: ${student.roomNumber || "Not Assigned"}`);
    doc.text(`Payment ID: ${payment.paymentId}`);
    doc.text(`Amount Paid: ₹${payment.amount}`);
    doc.text(`Date: ${payment.date.toDateString()}`);
    doc.text(`Status: ${payment.status}`);
    doc.moveDown();
    doc.text("Thank you for your payment!", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("❌ Error generating receipt:", error);
    res.status(500).send("Failed to generate receipt");
  }
};
