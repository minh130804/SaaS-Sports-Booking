const express = require("express");
const router = express.Router();
const {
  getStaffs,
  createStaff,
  deleteStaff,
} = require("../controllers/staff.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", restrictTo("OWNER", "STAFF"), getStaffs);

router.post("/", restrictTo("OWNER"), createStaff);
router.delete("/:id", restrictTo("OWNER"), deleteStaff);

module.exports = router;
