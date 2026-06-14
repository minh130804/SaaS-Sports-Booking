const { Plan, Tenant } = require("../models");

const getAllPlans = async () => {
  return await Plan.findAll({
    order: [["createdAt", "ASC"]],
  });
};

const createPlan = async (planData) => {
  return await Plan.create(planData);
};

const updatePlan = async (id, planData) => {
  const plan = await Plan.findByPk(id);
  if (!plan) throw { status: 404, message: "Không tìm thấy gói cước!" };

  if (plan.id === 1) {
    throw { status: 400, message: "Không được sửa gói Free mặc định hệ thống!" };
  }

  return await plan.update(planData);
};

const deletePlan = async (id) => {
  const plan = await Plan.findByPk(id);
  if (!plan) throw { status: 404, message: "Không tìm thấy gói cước!" };

  if (plan.id === 1) {
    throw { status: 400, message: "Không được xóa gói Free mặc định hệ thống!" };
  }

  // Cho phép xoá (Xoá mềm) kể cả khi có người dùng, vì đã có Snapshot

  await plan.destroy();
  return { message: "Xóa gói cước thành công" };
};

module.exports = {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
};
