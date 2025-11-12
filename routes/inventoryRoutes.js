import express from "express";
import {
  getAllInventory,
  addInventoryItem,
  updateInventoryStatus,
  deleteInventoryItem,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/", getAllInventory);
router.post("/add", addInventoryItem);
router.post("/:id/update", updateInventoryStatus);
router.post("/:id/delete", deleteInventoryItem);

export default router;
