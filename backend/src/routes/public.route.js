const express = require("express");
const router = express.Router();
const { getFields } = require("../controllers/public.controller");

router.get("/fields/:domain", getFields);

module.exports = router;
