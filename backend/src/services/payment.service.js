const { Booking, Field, User, Tenant } = require("../models");
const { Op } = require("sequelize");
const { createPaymentUrl, verifyReturnUrl } = require("../utils/vnpay.util");

const createBookingWithPayment = async (bookingData, userId, tenantId, clientIp) => {

  const payment_method = "VNPAY";

  if (bookingData.customer_name || bookingData.customer_phone || bookingData.customer_email) {
    const user = await User.findByPk(userId);
    if (user) {
      if (bookingData.customer_name) user.full_name = bookingData.customer_name;
      if (bookingData.customer_phone) user.phone = bookingData.customer_phone;
      if (bookingData.customer_email && !user.email) user.email = bookingData.customer_email;
      await user.save();
    }
  }

  const { sequelize } = require("../config/database");
  const t = await sequelize.transaction();

  try {
    const overlap = await Booking.findOne({
      where: {
        field_id: bookingData.field_id,
        booking_date: bookingData.booking_date,
        status: { [Op.ne]: "CANCELLED" },
        [Op.and]: [
          { start_time: { [Op.lt]: bookingData.end_time } },
          { end_time: { [Op.gt]: bookingData.start_time } },
        ],
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (overlap) {
      throw { status: 400, message: "Rất tiếc, khung giờ này vừa có người nhanh tay đặt mất!" };
    }

    const txnRef = `${Date.now()}${userId}`;

    const newBooking = await Booking.create({
      field_id: bookingData.field_id,
      booking_date: bookingData.booking_date,
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      total_price: bookingData.total_price,
      user_id: userId,
      tenant_id: tenantId,
      status: "PENDING",
      payment_method,
      payment_status: "UNPAID",
      vnpay_txn_ref: txnRef,
    }, { transaction: t });

    await t.commit();

    const field = await Field.findByPk(bookingData.field_id);
    const orderInfo = `Dat san ${field?.name || "the thao"} ngay ${bookingData.booking_date}`;
    const paymentUrl = createPaymentUrl(
      bookingData.total_price,
      orderInfo,
      txnRef,
      clientIp,
    );
    console.log("👉 Generated VNPAY URL:", paymentUrl);
    return { booking: newBooking, paymentUrl };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const handleVnpayReturn = async (vnpParams) => {
  const isValid = verifyReturnUrl(vnpParams);
  if (!isValid) {
    throw { status: 400, message: "Chữ ký không hợp lệ!" };
  }

  const txnRef = vnpParams["vnp_TxnRef"];
  const responseCode = vnpParams["vnp_ResponseCode"];

  const booking = await Booking.findOne({ where: { vnpay_txn_ref: txnRef } });
  if (!booking) {
    throw { status: 404, message: "Không tìm thấy đơn đặt sân tương ứng!" };
  }

  if (responseCode === "00") {

    booking.payment_status = "PAID";
    booking.status = "CONFIRMED";
    await booking.save();
    return { success: true, booking };
  } else {

    booking.payment_status = "UNPAID";
    booking.status = "CANCELLED";
    await booking.save();
    return { success: false, booking };
  }
};

module.exports = { createBookingWithPayment, handleVnpayReturn };
