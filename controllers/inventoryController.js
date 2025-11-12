import Inventory from "../models/inventory.js";
import Student from "../models/student.js";

// 📦 View all items
export const getAllInventory = async (req, res) => {
  try {
    const items = await Inventory.find().populate("assignedTo", "user roll");
    res.render("admin/inventory_dashboard", {
      title: "Hostel Inventory",
      items,
      user: req.session.user,
    });
  } catch (error) {
    console.error("🔥 Error loading inventory:", error);
    res.status(500).render("pages/error500", { error });
  }
};

// ➕ Add new item
export const addInventoryItem = async (req, res) => {
  try {
    const { itemName, quantity, condition, room, remarks } = req.body;
    await Inventory.create({ itemName, quantity, condition, room, remarks });
    req.flash("success", "Item added successfully!");
    res.redirect("/admin/inventory");
  } catch (error) {
    console.error("❌ Error adding item:", error);
    req.flash("error", "Failed to add item!");
    res.redirect("/admin/inventory");
  }
};

// 🛠 Update condition (Admin marks maintenance/damage)
export const updateInventoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, damageCharge } = req.body;

    const item = await Inventory.findById(id);
    if (!item) {
      req.flash("error", "Item not found!");
      return res.redirect("/admin/inventory");
    }

    item.condition = condition;
    if (damageCharge) item.damageCharge = damageCharge;

    await item.save();

    req.flash("success", "Inventory updated successfully!");
    res.redirect("/admin/inventory");
  } catch (error) {
    console.error("❌ Error updating inventory:", error);
    req.flash("error", "Update failed!");
    res.redirect("/admin/inventory");
  }
};

// ❌ Delete
export const deleteInventoryItem = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    req.flash("success", "Item deleted!");
    res.redirect("/admin/inventory");
  } catch (error) {
    console.error("🔥 Error deleting item:", error);
    req.flash("error", "Delete failed!");
    res.redirect("/admin/inventory");
  }
};
