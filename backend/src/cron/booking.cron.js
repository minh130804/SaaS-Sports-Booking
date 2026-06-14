const cron = require("node-cron");
const { Op } = require("sequelize");
const { Booking } = require("../models");

// Chạy mỗi 1 phút
cron.schedule("* * * * *", async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const expiredBookings = await Booking.findAll({
      where: {
        status: "PENDING",
        payment_status: "UNPAID",
        createdAt: {
          [Op.lt]: fiveMinutesAgo,
        },
      },
    });

    if (expiredBookings.length > 0) {
      const ids = expiredBookings.map((b) => b.id);
      await Booking.update(
        { status: "CANCELLED" },
        { where: { id: ids } }
      );
      console.log(`[Cron] Đã tự động hủy ${expiredBookings.length} lịch đặt chưa thanh toán quá 5 phút.`);
    }
  } catch (error) {
    console.error("[Cron] Lỗi khi quét lịch đặt hết hạn thanh toán:", error);
  }
});
