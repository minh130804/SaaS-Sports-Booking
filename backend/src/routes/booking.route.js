const express = require("express");
const router = express.Router();
const {
  getAvailableSlots,
  createBooking,
  getBookings,
  updateStatus,
  getTimeline,
  getMyBookings,
  updateBooking,
  deleteBooking,
  createOfflineBooking,
} = require("../controllers/booking.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/available-slots/:fieldId", getAvailableSlots);
router.get("/timeline/:domain", getTimeline);
router.post("/", restrictTo("CUSTOMER"), createBooking);
router.get("/my-history", restrictTo("CUSTOMER"), getMyBookings);

router.get("/tenant", restrictTo("OWNER", "STAFF"), getBookings);
router.post("/offline", restrictTo("OWNER", "STAFF"), createOfflineBooking);
router.put("/:id/status", restrictTo("OWNER"), updateStatus);

router.put("/:id", restrictTo("OWNER"), updateBooking);
router.delete("/:id", restrictTo("OWNER"), deleteBooking);

module.exports = router;
