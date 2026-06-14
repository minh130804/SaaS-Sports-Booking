const { User, Booking } = require("../models");
const bcrypt = require("bcryptjs");

const getCustomersByTenant = async (tenantId) => {
  return await User.findAll({
    where: { tenant_id: tenantId, role: "CUSTOMER" },
    attributes: ["id", "full_name", "phone", "email", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
};

const getCustomerDetail = async (id, tenantId) => {
  const customer = await User.findOne({
    where: { id, tenant_id: tenantId, role: "CUSTOMER" },
    attributes: ["id", "full_name", "phone", "email", "createdAt"],
  });

  if (!customer) throw { status: 404, message: "Không tìm thấy khách hàng!" };

  // Calculate total spending
  const bookings = await Booking.findAll({
    where: { user_id: id, tenant_id: tenantId, payment_status: "PAID" },
  });
  
  const total_spending = bookings.reduce((sum, booking) => sum + booking.total_price, 0);
  const total_bookings = bookings.length;

  return { ...customer.toJSON(), total_spending, total_bookings };
};

const createCustomer = async (customerData, tenantId) => {
  let existingUser = null;
  if (customerData.phone) {
    existingUser = await User.findOne({
      where: { phone: customerData.phone, tenant_id: tenantId, role: "CUSTOMER" },
    });
  }

  if (existingUser) {
    throw { status: 400, message: "Khách hàng với số điện thoại này đã tồn tại!" };
  }

  // Tạo username ngẫu nhiên cho khách hàng vãng lai
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const username = customerData.phone ? `kh_${customerData.phone}` : `kh_${Date.now()}_${randomSuffix}`;
  const hashedPassword = await bcrypt.hash("123456", 10); // Mật khẩu mặc định

  return await User.create({
    full_name: customerData.full_name,
    phone: customerData.phone || null,
    email: customerData.email || null,
    username: username,
    password: hashedPassword,
    role: "CUSTOMER",
    tenant_id: tenantId,
  });
};

const updateCustomer = async (id, customerData, tenantId) => {
  const customer = await User.findOne({
    where: { id, tenant_id: tenantId, role: "CUSTOMER" },
  });

  if (!customer) throw { status: 404, message: "Không tìm thấy khách hàng!" };

  if (customerData.phone && customerData.phone !== customer.phone) {
    const existingUser = await User.findOne({
      where: { phone: customerData.phone, tenant_id: tenantId, role: "CUSTOMER" },
    });
    if (existingUser) throw { status: 400, message: "Số điện thoại đã được sử dụng!" };
  }

  if (customerData.full_name !== undefined) customer.full_name = customerData.full_name;
  if (customerData.phone !== undefined) customer.phone = customerData.phone || null;
  if (customerData.email !== undefined) customer.email = customerData.email || null;

  await customer.save();
  return customer;
};

const deleteCustomer = async (id, tenantId) => {
  const customer = await User.findOne({
    where: { id, tenant_id: tenantId, role: "CUSTOMER" },
  });

  if (!customer) throw { status: 404, message: "Không tìm thấy khách hàng!" };

  // Kiểm tra xem khách hàng đã có lịch đặt nào chưa
  const hasBookings = await Booking.findOne({ where: { user_id: id } });
  if (hasBookings) {
    throw { status: 400, message: "Không thể xóa khách hàng đã có lịch sử đặt sân!" };
  }

  await customer.destroy();
  return { message: "Đã xóa khách hàng thành công" };
};

module.exports = {
  getCustomersByTenant,
  getCustomerDetail,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
