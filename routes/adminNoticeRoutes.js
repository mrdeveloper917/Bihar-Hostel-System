import express from "express";
import {
  getNotices,
  postNotice,
  updateNotice,
  deleteNotice,
} from "../controllers/adminNoticeController.js";

const router = express.Router();

// 📰 Notice Management Routes
router.get("/notices", getNotices);
router.post("/notices", postNotice);
router.post("/notices/edit/:id", updateNotice);
router.get("/notices/delete/:id", deleteNotice);

export default router;
