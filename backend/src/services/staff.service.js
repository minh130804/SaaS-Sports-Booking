const bcrypt = require("bcryptjs");
const { User, Tenant, Plan } = require("../models");

const checkStaffLimit = async (tenantId) => {
  const tenant = await Tenant.findByPk(tenantId, {
    include: [{ model: Plan, paranoid: false }]
  });
  if (!tenant || !tenant.Plan) {
    throw { status: 400, message: "Không tìm thấy thông tin gói dịch vụ của chủ sân!" };
  }

  const activeStaffCount = await User.count({
    where: { tenant_id: tenantId, role: "STAFF" }
  });

  const maxStaffs = tenant.current_max_staffs !== null ? tenant.current_max_staffs : tenant.Plan.max_staffs;

  if (activeStaffCount >= maxStaffs) {
    throw {
      status: 400,
      message: `Hệ thống của bạn đã đạt giới hạn tối đa ${maxStaffs} nhân viên. Vui lòng nâng cấp gói cước để thêm nhân viên mới!`
    };
  }
};

const getStaffsByTenant = async (tenantId) => {
  return await User.findAll({
    where: { tenant_id: tenantId, role: "STAFF" },
    attributes: { exclude: ["password"] }, // Không trả về mật khẩu
    order: [["createdAt", "DESC"]],
  });
};

const createStaff = async (staffData, tenantId) => {
  await checkStaffLimit(tenantId);

  const existingUser = await User.findOne({
    where: { username: staffData.username, tenant_id: tenantId },
  });
  if (existingUser) throw { status: 400, message: "Tên đăng nhập đã tồn tại!" };

  const hashedPassword = await bcrypt.hash(staffData.password, 10);

  return await User.create({
    ...staffData,
    password: hashedPassword,
    tenant_id: tenantId,
    role: "STAFF", // Bắt buộc gán role nhân viên
  });
};

const deleteStaff = async (id, tenantId) => {
  const staff = await User.findOne({
    where: { id, tenant_id: tenantId, role: "STAFF" },
  });
  if (!staff) throw { status: 404, message: "Không tìm thấy nhân viên!" };

  await staff.destroy();
  return { message: "Đã xóa tài khoản nhân viên" };
};

module.exports = { getStaffsByTenant, createStaff, deleteStaff };
