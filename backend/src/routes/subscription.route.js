const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscription.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

router.post(
  "/create-payment-url",
  protect,
  restrictTo("OWNER"),
  subscriptionController.createPaymentUrl
);

router.get("/vnpay-return", subscriptionController.vnpayReturn);

router.get("/vnpay-ipn", subscriptionController.vnpayIpn);

router.get(
  "/admin-payments",
  protect,
  restrictTo("SUPER_ADMIN"),
  subscriptionController.getSubscriptionPayments
);

module.exports = router;
