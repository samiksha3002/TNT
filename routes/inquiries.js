// backend/routes/inquiries.js
import express from "express";
import Inquiry from "../models/Inquiry.js"; // Ensure this path matches your file structure

const router = express.Router();

// ==========================================
// 1. CREATE NEW INQUIRY
// ==========================================
router.post("/", async (req, res) => {
  try {
    const inquiry = new Inquiry(req.body);
    await inquiry.save();
    res.status(201).json({ success: true, message: "Inquiry saved successfully", inquiry });
  } catch (err) {
    console.error("Error creating inquiry:", err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. GET ALL INQUIRIES
// ==========================================
router.get("/", async (req, res) => {
  try {
    // Sort by createdAt descending (newest first)
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (err) {
    console.error("Error fetching inquiries:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    
    res.status(200).json(inquiry);
  } catch (err) {
    console.error("Error fetching single inquiry:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. UPDATE INQUIRY
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // { new: true } returns the updated document instead of the old one
    const updatedInquiry = await Inquiry.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedInquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    res.status(200).json({ success: true, message: "Inquiry updated successfully", inquiry: updatedInquiry });
  } catch (err) {
    console.error("Error updating inquiry:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. DELETE INQUIRY
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInquiry = await Inquiry.findByIdAndDelete(id);

    if (!deletedInquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    res.status(200).json({ success: true, message: "Inquiry deleted successfully" });
  } catch (err) {
    console.error("Error deleting inquiry:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;