const express = require("express");
const router = express.Router();
const {
  getFields,
  createField,
  updateField,
  deleteField,
  restoreField,
} = require("../controllers/field.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", restrictTo("OWNER", "STAFF"), getFields);

router.post("/", restrictTo("OWNER"), createField);
router.put("/:id", restrictTo("OWNER"), updateField);
router.delete("/:id", restrictTo("OWNER"), deleteField);
router.put("/:id/restore", restrictTo("OWNER"), restoreField);

module.exports = router;
