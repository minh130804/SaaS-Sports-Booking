const { Booking, Field, User, Tenant } = require("../models");
const { Op } = require("sequelize");

const getAvailableSlots = async (fieldId, date) => {
  const field = await Field.findByPk(fieldId);
  if (!field) throw { status: 404, message: "Sân không tồn tại!" };

  let pricing = field.pricing;
  if (typeof pricing === "string") pricing = JSON.parse(pricing);

  const existingBookings = await Booking.findAll({
    where: {
      field_id: fieldId,
      booking_date: date,
      status: { [Op.ne]: "CANCELLED" },
    },
  });

  const slots = [];
  const vnTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
  );
  const todayStr =
    vnTime.getFullYear() +
    "-" +
    String(vnTime.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(vnTime.getDate()).padStart(2, "0");
  const currentTotalMins = vnTime.getHours() * 60 + vnTime.getMinutes();

  for (let mins = 300; mins < 1440; mins += 30) {
    const hStart = Math.floor(mins / 60);
    const mStart = mins % 60;
    const hEnd = Math.floor((mins + 30) / 60);
    const mEnd = (mins + 30) % 60;

    const startTime = `${String(hStart).padStart(2, "0")}:${String(mStart).padStart(2, "0")}`;
    const endTime =
      hEnd === 24
        ? "00:00"
        : `${String(hEnd).padStart(2, "0")}:${String(mEnd).padStart(2, "0")}`;

    const isBooked = existingBookings.some((b) => {
      const bStart = b.start_time.substring(0, 5);
      let bEnd = b.end_time.substring(0, 5);
      if (b.end_time === "23:59:59" || b.end_time === "24:00:00")
        bEnd = "00:00";
      const checkEnd = bEnd === "00:00" ? "24:00" : bEnd;
      const checkStart = startTime;
      return checkStart >= bStart && checkStart < checkEnd;
    });

    let isPast = false;
    if (date < todayStr) isPast = true;
    else if (date === todayStr && mins <= currentTotalMins) isPast = true;

    let priceFor30Min = 0;
    for (let rule of pricing) {
      if (startTime >= rule.startTime && startTime < rule.endTime) {
        priceFor30Min = Number(rule.price) / 2;
        break;
      }
    }
    slots.push({ startTime, endTime, isBooked, isPast, price: priceFor30Min });
  }

  return slots;
};

const createBooking = async (bookingData, userId, tenantId) => {
  let finalUserId = userId;

  if (bookingData.customer_phone || bookingData.customer_name) {
    let customer = null;
    if (bookingData.customer_phone) {
      customer = await User.findOne({
        where: { phone: bookingData.customer_phone, tenant_id: tenantId, role: "CUSTOMER" }
      });
    }

    if (!customer) {
      const bcrypt = require("bcryptjs");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const username = bookingData.customer_phone ? `kh_${bookingData.customer_phone}` : `kh_${Date.now()}_${randomSuffix}`;
      const hashedPassword = await bcrypt.hash("123456", 10);
      
      customer = await User.create({
        full_name: bookingData.customer_name || "Khách vãng lai",
        phone: bookingData.customer_phone || null,
        email: bookingData.customer_email || null,
        username: username,
        password: hashedPassword,
        role: "CUSTOMER",
        tenant_id: tenantId,
      });
    } else {
      let updated = false;
      if (bookingData.customer_name && customer.full_name !== bookingData.customer_name) {
        customer.full_name = bookingData.customer_name;
        updated = true;
      }
      if (bookingData.customer_email && !customer.email) {
        customer.email = bookingData.customer_email;
        updated = true;
      }
      if (updated) await customer.save();
    }
    finalUserId = customer.id;
  }

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
  });

  if (overlap) {
    throw {
      status: 400,
      message: "Rất tiếc, khung giờ này vừa có người nhanh tay đặt mất!",
    };
  }

  const newBooking = await Booking.create({
    ...bookingData,
    user_id: finalUserId,
    tenant_id: tenantId,
    status: "PENDING",
  });

  return newBooking;
};

const getBookingsByTenant = async (tenantId) => {
  return await Booking.findAll({
    where: { tenant_id: tenantId },
    order: [["createdAt", "DESC"]],
    include: [
      { model: User, as: "customer", attributes: ["full_name", "phone"] },
      { model: Field, attributes: ["name", "type"] },
    ],
  });
};

const updateBookingStatus = async (id, status, tenantId) => {
  const booking = await Booking.findOne({ where: { id, tenant_id: tenantId } });
  if (!booking) throw { status: 404, message: "Không tìm thấy lịch đặt!" };

  booking.status = status;
  await booking.save();

  if (status === "CONFIRMED") {
    try {
      const { Tenant, Field, User } = require("../models");
      const tenant = await Tenant.findByPk(tenantId);
      const field = await Field.findByPk(booking.field_id);
      const user = await User.findByPk(booking.user_id);
      
      if (user && user.email) {
        const emailService = require("./email.service");
        const bookingDetails = {
          id: booking.id,
          tenantName: tenant?.name || "Hệ thống Sân bóng",
          customerName: user.full_name,
          customerPhone: user.phone || "",
          fieldName: field?.name || "Sân",
          date: booking.booking_date,
          time: `${booking.start_time.substring(0,5)} - ${booking.end_time.substring(0,5)}`,
          paymentMethod: booking.payment_method,
          price: booking.total_price
        };
        emailService.sendInvoiceEmail(user.email, bookingDetails);
      }
    } catch (err) {
      console.error("Lỗi khi gửi email xác nhận đặt sân:", err);
    }
  }

  return booking;
};

const getTimelineByDomain = async (domain, date, fieldId = null) => {
  const tenant = await Tenant.findOne({ where: { custom_domain: domain } });
  if (!tenant) throw { status: 404, message: "Hệ thống sân không tồn tại!" };

  const whereClause = { tenant_id: tenant.id, deletedAt: null };
  if (fieldId) {
    whereClause.id = fieldId;
  }

  const fields = await Field.findAll({
    where: whereClause,
  });

  const bookings = await Booking.findAll({
    where: {
      tenant_id: tenant.id,
      booking_date: date,
      status: { [Op.ne]: "CANCELLED" },
    },
  });

  const vnTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
  );
  const todayStr =
    vnTime.getFullYear() +
    "-" +
    String(vnTime.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(vnTime.getDate()).padStart(2, "0");
  const currentTotalMins = vnTime.getHours() * 60 + vnTime.getMinutes();

  const timeToMins = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  let globalMinMins = 1440;
  let globalMaxMins = 0;

  fields.forEach(field => {
    let pricing = field.pricing;
    if (typeof pricing === "string") {
      try { pricing = JSON.parse(pricing); } catch (e) { pricing = []; }
    }
    if (pricing && pricing.length > 0) {
      pricing.forEach(rule => {
        globalMinMins = Math.min(globalMinMins, timeToMins(rule.startTime));
        globalMaxMins = Math.max(globalMaxMins, timeToMins(rule.endTime));
      });
    }
  });

  if (globalMinMins >= globalMaxMins) {

    globalMinMins = 0;
    globalMaxMins = 0;
  }

  const timeline = fields.map((field) => {
    let pricing = field.pricing;
    if (typeof pricing === "string") {
      try {
        pricing = JSON.parse(pricing);
      } catch (e) {
        pricing = [];
      }
    }

    const fieldBookings = bookings.filter((b) => b.field_id === field.id);
    const slots = [];

    for (let mins = globalMinMins; mins < globalMaxMins; mins += 30) {
      const hStart = Math.floor(mins / 60);
      const mStart = mins % 60;
      const hEnd = Math.floor((mins + 30) / 60);
      const mEnd = (mins + 30) % 60;

      const startTime = `${String(hStart).padStart(2, "0")}:${String(mStart).padStart(2, "0")}`;
      const endTime =
        hEnd === 24
          ? "00:00"
          : `${String(hEnd).padStart(2, "0")}:${String(mEnd).padStart(2, "0")}`;

      const isBooked = fieldBookings.some((b) => {
        const bStart = b.start_time.substring(0, 5);
        let bEnd = b.end_time.substring(0, 5);
        if (b.end_time === "23:59:59" || b.end_time === "24:00:00")
          bEnd = "00:00";

        const checkEnd = bEnd === "00:00" ? "24:00" : bEnd;
        const checkStart = startTime;
        return checkStart >= bStart && checkStart < checkEnd;
      });

      let isPast = false;
      if (date < todayStr) isPast = true;
      else if (date === todayStr && mins <= currentTotalMins) isPast = true;

      let priceFor30Min = 0;
      let isAvailable = false;
      if (pricing && pricing.length > 0) {
        for (let rule of pricing) {
          if (startTime >= rule.startTime && startTime < rule.endTime) {
            priceFor30Min = Number(rule.price) / 2;
            isAvailable = true;
            break;
          }
        }
      } else {
        isAvailable = true;
      }
      slots.push({
        startTime,
        endTime,
        isBooked,
        isPast,
        isAvailable,
        price: priceFor30Min,
      });
    }
    return { fieldId: field.id, fieldName: field.name, fieldType: field.type, slots };
  });

  return timeline;
};
const getCustomerBookings = async (userId) => {
  return await Booking.findAll({
    where: { user_id: userId },
    order: [["createdAt", "DESC"]], // Sắp xếp lịch mới đặt lên đầu
    include: [
      { model: Field, attributes: ["name", "address"] },
      { model: Tenant, attributes: ["name", "custom_domain"] },
    ],
  });
};

const updateBookingByOwner = async (id, updateData, tenantId) => {
  const booking = await Booking.findOne({ where: { id, tenant_id: tenantId } });
  if (!booking) throw { status: 404, message: "Không tìm thấy lịch đặt!" };

  if (updateData.booking_date || updateData.start_time || updateData.end_time) {
    const newDate = updateData.booking_date || booking.booking_date;
    const newStart = updateData.start_time || booking.start_time;
    const newEnd = updateData.end_time || booking.end_time;
    const fieldId = updateData.field_id || booking.field_id;

    const overlap = await Booking.findOne({
      where: {
        id: { [Op.ne]: id }, // Loại trừ chính booking đang sửa
        field_id: fieldId,
        booking_date: newDate,
        status: { [Op.ne]: "CANCELLED" },
        [Op.and]: [
          { start_time: { [Op.lt]: newEnd } },
          { end_time: { [Op.gt]: newStart } },
        ],
      },
    });
    if (overlap) throw { status: 400, message: "Khung giờ mới bị trùng với lịch đặt khác!" };
  }

  await booking.update(updateData);
  return booking;
};

const deleteBookingByOwner = async (id, tenantId) => {
  const booking = await Booking.findOne({ where: { id, tenant_id: tenantId } });
  if (!booking) throw { status: 404, message: "Không tìm thấy lịch đặt!" };

  await booking.destroy();
  return { message: "Đã xóa lịch đặt thành công" };
};

const createOfflineBooking = async (bookingData, tenantId) => {
  const { customer_name, customer_phone, customer_email, field_id, booking_date, start_time, end_time, payment_method, payment_status, total_price } = bookingData;

  const overlap = await Booking.findOne({
    where: {
      field_id: field_id,
      booking_date: booking_date,
      status: { [Op.ne]: "CANCELLED" },
      [Op.and]: [
        { start_time: { [Op.lt]: end_time } },
        { end_time: { [Op.gt]: start_time } },
      ],
    },
  });

  if (overlap) {
    throw {
      status: 400,
      message: "Khung giờ này đã có người đặt, vui lòng chọn giờ khác!",
    };
  }

  let user = null;
  if (customer_phone) {
    user = await User.findOne({ where: { phone: customer_phone, role: "CUSTOMER" } });
  } else if (customer_email) {
    user = await User.findOne({ where: { email: customer_email, role: "CUSTOMER" } });
  }

  if (!user) {
    const bcrypt = require("bcryptjs");
    const generatedUsername = customer_phone ? `kh_${customer_phone}` : (customer_email ? `kh_${customer_email}` : `kh_${Date.now()}`);
    const generatedPassword = await bcrypt.hash("123456", 10);
    user = await User.create({
      tenant_id: tenantId, 
      username: generatedUsername,
      password: generatedPassword,
      full_name: customer_name || "Khách vãng lai",
      phone: customer_phone || null,
      email: customer_email || null,
      role: "CUSTOMER"
    });
  } else {
    // Cập nhật email nếu user cũ chưa có email
    if (customer_email && !user.email) {
      user.email = customer_email;
      await user.save();
    }
  }

  const newBooking = await Booking.create({
    field_id,
    booking_date,
    start_time,
    end_time,
    total_price: total_price || 0,
    payment_method: payment_method || "CASH",
    payment_status: payment_status || "UNPAID",
    user_id: user.id,
    tenant_id: tenantId,
    status: "CONFIRMED", 
  });

  // Gửi email hoá đơn nếu có email
  if (user.email) {
    try {
      const { Tenant, Field } = require("../models");
      const tenant = await Tenant.findByPk(tenantId);
      const field = await Field.findByPk(field_id);
      const emailService = require("./email.service");
      
      const bookingDetails = {
        id: newBooking.id,
        tenantName: tenant?.name || "Hệ thống Sân bóng",
        customerName: user.full_name,
        customerPhone: user.phone || "",
        fieldName: field?.name || "Sân",
        date: newBooking.booking_date,
        time: `${newBooking.start_time.substring(0,5)} - ${newBooking.end_time.substring(0,5)}`,
        paymentMethod: newBooking.payment_method,
        price: newBooking.total_price
      };
      
      emailService.sendInvoiceEmail(user.email, bookingDetails);
    } catch (err) {
      console.error("Lỗi khi gửi email offline booking:", err);
    }
  }

  return newBooking;
};

module.exports = {
  getAvailableSlots,
  createBooking,
  getBookingsByTenant,
  updateBookingStatus,
  getTimelineByDomain,
  getCustomerBookings,
  updateBookingByOwner,
  deleteBookingByOwner,
  createOfflineBooking,
};
