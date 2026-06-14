const fieldService = require("../services/field.service");

const getFields = async (req, res) => {
  try {
    const fields = await fieldService.getFieldsByTenant(req.user.tenant_id);
    res.status(200).json({ data: fields });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách sân" });
  }
};

const createField = async (req, res) => {
  try {
    const newField = await fieldService.createField(
      req.body,
      req.user.tenant_id,
    );
    res.status(201).json({ message: "Tạo sân thành công", data: newField });
  } catch (error) {
    res.status(400).json({ message: error.message || "Lỗi khi tạo sân" });
  }
};

const updateField = async (req, res) => {
  try {
    const updatedField = await fieldService.updateField(
      req.params.id,
      req.body,
      req.user.tenant_id,
    );
    res
      .status(200)
      .json({ message: "Cập nhật thành công", data: updatedField });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const deleteField = async (req, res) => {
  try {
    await fieldService.deleteField(req.params.id, req.user.tenant_id);
    res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
const restoreField = async (req, res) => {
  try {
    await fieldService.restoreField(req.params.id, req.user.tenant_id);
    res.status(200).json({ message: "Khôi phục thành công" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = {
  getFields,
  createField,
  updateField,
  deleteField,
  restoreField,
};
