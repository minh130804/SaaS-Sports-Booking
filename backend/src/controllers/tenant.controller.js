const tenantService = require("../services/tenant.service");

const createTenant = async (req, res) => {
  try {

    const {
      tenantName,
      custom_domain,
      domain, // Lấy dự phòng trong trường hợp Frontend gửi key là 'domain'
      username,
      password,
      full_name,
      phone,
      email,
    } = req.body;

    const payload = {
      name: tenantName, // Truyền tên thương hiệu vào đây
      domain: custom_domain || domain,
      username: username,
      password: password,
      full_name: full_name,
      phone: phone,
      email: email,
    };

    const result = await tenantService.createTenant(payload);

    res.status(201).json({
      message: "Tạo chủ sân và tài khoản quản trị thành công!",
      data: result,
    });
  } catch (error) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({ message: error.message || "Lỗi máy chủ" });
  }
};

const getTenants = async (req, res) => {
  try {
    const tenants = await tenantService.getAllTenants();
    res.status(200).json({
      message: "Lấy danh sách thành công",
      data: tenants,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách chủ sân" });
  }
};

const deleteTenant = async (req, res) => {
  try {
    await tenantService.deleteTenant(req.params.id);
    res.status(200).json({ message: "Xóa hệ thống thành công" });
  } catch (error) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({ message: error.message || "Lỗi máy chủ" });
  }
};

const getMyPlan = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const tenant = await tenantService.getTenantWithPlan(tenantId);
    res.status(200).json({ data: tenant });
  } catch (error) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({ message: error.message || "Lỗi máy chủ" });
  }
};

const upgradeMyPlan = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { plan_id } = req.body;
    const result = await tenantService.updateTenantPlan(tenantId, plan_id);
    res.status(200).json({ message: "Cập nhật gói cước thành công!", data: result });
  } catch (error) {
    const statusCode = error.status || 400;
    res.status(statusCode).json({ message: error.message || "Lỗi máy chủ" });
  }
};

const getSettings = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const settings = await tenantService.getSettings(tenantId);
    res.status(200).json({ data: settings });
  } catch (error) {
    const statusCode = error.status || 500;
    res.status(statusCode).json({ message: error.message || "Lỗi máy chủ" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const data = req.body;
    const result = await tenantService.updateSettings(tenantId, data);
    res.status(200).json({ message: "Cập nhật thông tin thành công!", data: result });
  } catch (error) {
    const statusCode = error.status || 400;
    res.status(statusCode).json({ message: error.message || "Lỗi máy chủ" });
  }
};

module.exports = {
  createTenant,
  getTenants,
  deleteTenant,
  getMyPlan,
  upgradeMyPlan,
  getSettings,
  updateSettings,
};
