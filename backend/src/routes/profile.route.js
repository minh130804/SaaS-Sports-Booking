const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/me", profileController.getMyProfile);
router.put("/me", profileController.updateMyProfile);

module.exports = router;
