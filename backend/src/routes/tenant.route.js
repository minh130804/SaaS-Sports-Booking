const express = require("express");
const router = express.Router();
const {
  createTenant,
  getTenants,
  deleteTenant,
  getMyPlan,
  upgradeMyPlan,
  getSettings,
  updateSettings,
} = require("../controllers/tenant.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

router.post("/create", protect, restrictTo("SUPER_ADMIN"), createTenant);
router.get("/", protect, restrictTo("SUPER_ADMIN"), getTenants);
router.delete("/:id", protect, restrictTo("SUPER_ADMIN"), deleteTenant);

router.get("/my-plan", protect, restrictTo("OWNER"), getMyPlan);
router.put("/my-plan", protect, restrictTo("OWNER"), upgradeMyPlan);

router.get("/settings", protect, restrictTo("OWNER"), getSettings);
router.put("/settings", protect, restrictTo("OWNER"), updateSettings);

module.exports = router;
