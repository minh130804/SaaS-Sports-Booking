const bookingService = require("../services/booking.service");

const getAvailableSlots = async (req, res) => {
  try {
    const slots = await bookingService.getAvailableSlots(
      req.params.fieldId,
      req.query.date,
    );
    res.status(200).json({ data: slots });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const newBooking = await bookingService.createBooking(
      req.body,
      req.user.id,
      req.user.tenant_id,
    );
    res.status(201).json({
      message: "Đặt sân thành công! Vui lòng chờ xác nhận.",
      data: newBooking,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getBookingsByTenant(
      req.user.tenant_id,
    );
    res.status(200).json({ data: bookings });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải danh sách lịch đặt" });
  }
};

const updateStatus = async (req, res) => {
  try {
    await bookingService.updateBookingStatus(
      req.params.id,
      req.body.status,
      req.user.tenant_id,
    );
    res.status(200).json({ message: "Đã cập nhật trạng thái!" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getTimeline = async (req, res) => {
  try {
    const timeline = await bookingService.getTimelineByDomain(
      req.params.domain,
      req.query.date,
      req.query.fieldId
    );
    res.status(200).json({ data: timeline });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getCustomerBookings(req.user.id);
    res.status(200).json({ data: bookings });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải lịch sử đặt sân" });
  }
};

const updateBooking = async (req, res) => {
  try {
    const updated = await bookingService.updateBookingByOwner(
      req.params.id,
      req.body,
      req.user.tenant_id,
    );
    res.status(200).json({ message: "Cập nhật lịch đặt thành công!", data: updated });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const result = await bookingService.deleteBookingByOwner(
      req.params.id,
      req.user.tenant_id,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const createOfflineBooking = async (req, res) => {
  try {
    const newBooking = await bookingService.createOfflineBooking(
      req.body,
      req.user.tenant_id,
    );
    res.status(201).json({
      message: "Đặt sân hộ thành công!",
      data: newBooking,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = {
  getAvailableSlots,
  createBooking,
  getBookings,
  updateStatus,
  getTimeline,
  getMyBookings,
  updateBooking,
  deleteBooking,
  createOfflineBooking,
};
