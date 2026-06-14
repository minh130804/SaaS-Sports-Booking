const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// Cả OWNER và STAFF đều có thể quản lý khách hàng
router.use(protect, restrictTo("OWNER", "STAFF"));

router.get("/", customerController.getCustomers);
router.get("/:id", customerController.getCustomerDetail);
router.post("/", customerController.createCustomer);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
