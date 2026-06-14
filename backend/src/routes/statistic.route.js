const express = require("express");
const router = express.Router();
const statisticController = require("../controllers/statistic.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

router.get(
  "/owner-revenue",
  protect,
  restrictTo("OWNER"),
  statisticController.getOwnerRevenue
);

router.get(
  "/admin-revenue",
  protect,
  restrictTo("SUPER_ADMIN"),
  statisticController.getAdminRevenue
);

module.exports = router;
