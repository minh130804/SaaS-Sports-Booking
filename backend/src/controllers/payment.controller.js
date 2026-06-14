const paymentService = require("../services/payment.service");

const createPayment = async (req, res) => {
  try {
    const clientIp =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      "127.0.0.1";

    const result = await paymentService.createBookingWithPayment(
      req.body,
      req.user.id,
      req.user.tenant_id,
      clientIp,
    );

    if (result.paymentUrl) {
      return res.status(201).json({
        message: "Tạo đơn đặt sân thành công! Đang chuyển sang cổng thanh toán VNPay...",
        data: result.booking,
        paymentUrl: result.paymentUrl,
      });
    }

    return res.status(201).json({
      message: "Đặt sân thành công! Vui lòng chờ xác nhận từ chủ sân.",
      data: result.booking,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Lỗi khi tạo đặt sân" });
  }
};

const vnpayReturn = async (req, res) => {
  try {
    const result = await paymentService.handleVnpayReturn(req.query);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const domain = result.booking?.Tenant?.custom_domain;

    if (result.success) {

      const booking = result.booking;

      const { Tenant, User, Field } = require("../models");
      const tenant = await Tenant.findByPk(booking.tenant_id);
      const tenantDomain = tenant?.custom_domain || "default";

      // Lấy thêm thông tin user và field để gửi email
      const user = await User.findByPk(booking.user_id);
      const field = await Field.findByPk(booking.field_id);
      const owner = await User.findOne({ where: { tenant_id: booking.tenant_id, role: 'OWNER' } });

      const emailService = require("../services/email.service");
      const bookingDetails = {
        id: booking.id,
        tenantName: tenant?.name || "Hệ thống Sân bóng",
        customerName: user?.full_name || "Khách hàng",
        customerPhone: user?.phone || "",
        fieldName: field?.name || "Sân",
        date: booking.booking_date,
        time: `${booking.start_time.substring(0,5)} - ${booking.end_time.substring(0,5)}`,
        paymentMethod: booking.payment_method,
        price: booking.total_price
      };

      if (user && user.email) {
        emailService.sendInvoiceEmail(user.email, bookingDetails);
      }
      
      if (owner && owner.email) {
        emailService.sendNewBookingToOwner(owner.email, bookingDetails);
      }

      return res.redirect(
        `${frontendUrl}/${tenantDomain}/payment-result?status=success&bookingId=${booking.id}`,
      );
    } else {
      const booking = result.booking;
      const { Tenant } = require("../models");
      const tenant = await Tenant.findByPk(booking.tenant_id);
      const tenantDomain = tenant?.custom_domain || "default";

      return res.redirect(
        `${frontendUrl}/${tenantDomain}/payment-result?status=failed&bookingId=${booking.id}`,
      );
    }
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/payment-result?status=error`);
  }
};

module.exports = { createPayment, vnpayReturn };
