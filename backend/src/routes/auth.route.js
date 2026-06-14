const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  loginTenant,
  registerTenant,
  tenantForgotPassword,
} = require("../controllers/auth.controller");

router.post("/admin/login", loginAdmin);
router.post("/tenant/login", loginTenant);
router.post("/tenant/register", registerTenant);
router.post("/tenant/forgot-password", tenantForgotPassword);

module.exports = router;
