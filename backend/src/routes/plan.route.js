const express = require("express");
const router = express.Router();
const {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} = require("../controllers/plan.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", restrictTo("SUPER_ADMIN", "OWNER"), getPlans);

router.post("/", restrictTo("SUPER_ADMIN"), createPlan);
router.put("/:id", restrictTo("SUPER_ADMIN"), updatePlan);
router.delete("/:id", restrictTo("SUPER_ADMIN"), deletePlan);

module.exports = router;
