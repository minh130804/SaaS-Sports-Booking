const customerService = require("../services/customer.service");

const getCustomers = async (req, res) => {
  try {
    const customers = await customerService.getCustomersByTenant(req.user.tenant_id);
    res.status(200).json({ data: customers });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách khách hàng" });
  }
};

const createCustomer = async (req, res) => {
  try {
    const customer = await customerService.createCustomer(req.body, req.user.tenant_id);
    res.status(201).json({ message: "Thêm khách hàng thành công", data: customer });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body, req.user.tenant_id);
    res.status(200).json({ message: "Cập nhật thành công", data: customer });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const result = await customerService.deleteCustomer(req.params.id, req.user.tenant_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

const getCustomerDetail = async (req, res) => {
  try {
    const customer = await customerService.getCustomerDetail(req.params.id, req.user.tenant_id);
    res.status(200).json({ data: customer });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerDetail,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
