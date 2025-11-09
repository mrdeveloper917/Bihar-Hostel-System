import express from "express";
import { getStudentNotices } from "../controllers/noticeController.js";

const router = express.Router();

router.get("/student/notices", getStudentNotices);

export default router;
