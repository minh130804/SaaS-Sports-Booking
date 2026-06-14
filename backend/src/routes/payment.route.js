const express = require("express");
const router = express.Router();
const { createPayment, vnpayReturn } = require("../controllers/payment.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

router.post("/create", protect, restrictTo("CUSTOMER"), createPayment);

router.get("/vnpay-return", vnpayReturn);

module.exports = router;
