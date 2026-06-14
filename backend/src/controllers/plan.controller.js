const planService = require("../services/plan.service");

const getPlans = async (req, res) => {
  try {
    const plans = await planService.getAllPlans();
    res.status(200).json({ data: plans });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi lấy danh sách gói cước" });
  }
};

const createPlan = async (req, res) => {
  try {
    const newPlan = await planService.createPlan(req.body);
    res.status(201).json({ message: "Tạo gói cước thành công", data: newPlan });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || "Lỗi khi tạo gói cước" });
  }
};

const updatePlan = async (req, res) => {
  try {
    const updatedPlan = await planService.updatePlan(req.params.id, req.body);
    res.status(200).json({ message: "Cập nhật gói cước thành công", data: updatedPlan });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || "Lỗi khi cập nhật gói cước" });
  }
};

const deletePlan = async (req, res) => {
  try {
    const result = await planService.deletePlan(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || "Lỗi khi xóa gói cước" });
  }
};

module.exports = {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
};
