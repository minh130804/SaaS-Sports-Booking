const bcrypt = require("bcryptjs");
const { Tenant, User, Plan } = require("../models");

const getAllTenants = async () => {

  const tenants = await Tenant.findAll({
    include: [{ model: Plan, paranoid: false }],
    order: [["createdAt", "DESC"]],
  });

  const result = [];
  for (let tenant of tenants) {
    const owner = await User.findOne({
      where: { tenant_id: tenant.id, role: "OWNER" },
      attributes: ["full_name", "username", "phone", "email"], // Chỉ lấy các cột cần thiết
    });

    result.push({
      ...tenant.toJSON(),
      ownerInfo: owner || {},
    });
  }

  return result;
};

const createTenant = async (tenantData) => {
  const existingTenant = await Tenant.findOne({
    where: { custom_domain: tenantData.domain },
  });
  if (existingTenant)
    throw { status: 400, message: "Tên miền (Domain) này đã được sử dụng!" };

  const plan = await Plan.findByPk(1);

  const newTenant = await Tenant.create({
    name: tenantData.name,
    custom_domain: tenantData.domain,
    plan_id: 1,
    current_max_fields: plan ? plan.max_fields : 2,
    current_max_staffs: plan ? plan.max_staffs : 2,
  });

  const hashedPassword = await bcrypt.hash(tenantData.password, 10);
  const ownerUser = await User.create({
    tenant_id: newTenant.id,
    username: tenantData.username,
    password: hashedPassword,
    full_name: tenantData.full_name,
    phone: tenantData.phone,
    email: tenantData.email,
    role: "OWNER",
  });

  return { tenant: newTenant, owner: ownerUser };
};

const deleteTenant = async (id) => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) throw { status: 404, message: "Hệ thống sân không tồn tại" };

  if (tenant.subscription_end_date && new Date(tenant.subscription_end_date) > new Date()) {
    throw { status: 400, message: "Chủ sân vẫn còn thời hạn sử dụng gói cước. Không thể xoá!" };
  }

  await tenant.destroy();
  return { message: "Đã xóa hệ thống sân thành công" };
};

const getTenantWithPlan = async (id) => {
  const tenant = await Tenant.findByPk(id, {
    include: [{ model: Plan, paranoid: false }],
  });
  if (!tenant) throw { status: 404, message: "Hệ thống sân không tồn tại" };
  return tenant;
};

const updateTenantPlan = async (id, planId) => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) throw { status: 404, message: "Hệ thống sân không tồn tại" };

  const plan = await Plan.findByPk(planId);
  if (!plan) throw { status: 404, message: "Gói cước không tồn tại" };

  const { Field, User } = require("../models");
  const fieldCount = await Field.count({ where: { tenant_id: id } });
  const staffCount = await User.count({ where: { tenant_id: id, role: "STAFF" } });

  if (fieldCount > plan.max_fields || staffCount > plan.max_staffs) {
    throw { 
      status: 400, 
      message: `Không thể chuyển gói! Hệ thống của bạn đang có ${fieldCount} sân và ${staffCount} nhân viên. Gói cước "${plan.name}" chỉ cho phép tối đa ${plan.max_fields} sân và ${plan.max_staffs} nhân viên. Vui lòng xoá bớt trước khi đổi gói cước.` 
    };
  }

  tenant.plan_id = planId;
  tenant.current_max_fields = plan.max_fields;
  tenant.current_max_staffs = plan.max_staffs;
  await tenant.save();

  return await Tenant.findByPk(id, {
    include: [{ model: Plan, paranoid: false }],
  });
};

const getSettings = async (id) => {
  const tenant = await Tenant.findByPk(id, {
    attributes: ["name", "custom_domain", "address", "phone", "open_time", "close_time", "logo_url"]
  });
  if (!tenant) throw { status: 404, message: "Hệ thống sân không tồn tại" };
  return tenant;
};

const updateSettings = async (id, data) => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) throw { status: 404, message: "Hệ thống sân không tồn tại" };

  if (data.name !== undefined) tenant.name = data.name;
  if (data.address !== undefined) tenant.address = data.address;
  if (data.phone !== undefined) tenant.phone = data.phone;
  if (data.open_time !== undefined) tenant.open_time = data.open_time;
  if (data.close_time !== undefined) tenant.close_time = data.close_time;
  if (data.logo_url !== undefined) tenant.logo_url = data.logo_url;

  await tenant.save();
  return tenant;
};

module.exports = {
  getAllTenants,
  createTenant,
  deleteTenant,
  getTenantWithPlan,
  updateTenantPlan,
  getSettings,
  updateSettings,
};
