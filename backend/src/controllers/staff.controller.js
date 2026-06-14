const staffService = require("../services/staff.service");

const getStaffs = async (req, res) => {
  try {
    const staffs = await staffService.getStaffsByTenant(req.user.tenant_id);
    res.status(200).json({ data: staffs });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách nhân viên" });
  }
};

const createStaff = async (req, res) => {
  try {
    const newStaff = await staffService.createStaff(
      req.body,
      req.user.tenant_id,
    );
    res
      .status(201)
      .json({ message: "Tạo tài khoản thành công", data: newStaff });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    await staffService.deleteStaff(req.params.id, req.user.tenant_id);
    res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = { getStaffs, createStaff, deleteStaff };
