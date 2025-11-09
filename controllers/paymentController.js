import crypto from "crypto";
import PDFDocument from "pdfkit";
import { razorpay } from "../config/razorpay.js";
import Student from "../models/student.js";

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const studentId = req.session.user._id;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const student = await Student.findOne({ user: studentId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.feeStatus = "Paid";
    student.payments.push({
      paymentId,
      amount: 5000, // example fee amount
      method: "Razorpay",
      status: "Success",
    });
    await student.save();

    res.json({ success: true, message: "Payment verified successfully!" });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
};

// 🧾 Download PDF Receipt
export const downloadReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const student = await Student.findOne({
      "payments.paymentId": paymentId,
    }).populate("user");

    if (!student) return res.status(404).send("Receipt not found");

    const payment = student.payments.find((p) => p.paymentId === paymentId);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${paymentId}.pdf`
    );
    doc.pipe(res);

    doc.fontSize(20).text("Hostel Fee Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Student Name: ${student.user.name}`);
    doc.text(`Email: ${student.user.email}`);
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
