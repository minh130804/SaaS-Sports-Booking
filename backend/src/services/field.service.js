const { Field, Tenant, Plan } = require("../models");
const { Op } = require("sequelize");

const checkFieldLimit = async (tenantId) => {
  const tenant = await Tenant.findByPk(tenantId, {
    include: [{ model: Plan, paranoid: false }]
  });
  if (!tenant || !tenant.Plan) {
    throw { status: 400, message: "Không tìm thấy thông tin gói dịch vụ của chủ sân!" };
  }

  const activeFieldsCount = await Field.count({
    where: { tenant_id: tenantId },
    paranoid: false
  });

  const maxFields = tenant.current_max_fields !== null ? tenant.current_max_fields : tenant.Plan.max_fields;

  if (activeFieldsCount >= maxFields) {
    throw {
      status: 400,
      message: `Hệ thống của bạn đã đạt giới hạn tối đa ${maxFields} sân. Vui lòng nâng cấp gói cước để thêm sân mới!`
    };
  }
};

const checkDuplicateField = async (tenantId, name, address, type, excludeId = null) => {
  const whereClause = {
    tenant_id: tenantId,
    name: name,
    address: address,
    type: type
  };

  if (excludeId) {
    whereClause.id = { [Op.ne]: excludeId };
  }

  const existing = await Field.findOne({ where: whereClause });
  if (existing) {
    throw { status: 400, message: `Tên sân "${name}" (môn ${type}) đã tồn tại tại địa chỉ "${address}"!` };
  }
};

const getFieldsByTenant = async (tenantId) => {
  return await Field.findAll({
    where: { tenant_id: tenantId },
    order: [["createdAt", "DESC"]],
    paranoid: false, // MỚI: Báo cho Sequelize lấy cả những record đã có deletedAt
  });
};

const createField = async (fieldData, tenantId) => {
  await checkFieldLimit(tenantId);
  await checkDuplicateField(tenantId, fieldData.name, fieldData.address, fieldData.type);
  return await Field.create({
    ...fieldData,
    tenant_id: tenantId,
  });
};

const updateField = async (id, fieldData, tenantId) => {
  const field = await Field.findOne({ where: { id, tenant_id: tenantId } });
  if (!field) throw { status: 404, message: "Không tìm thấy sân!" };

  const name = fieldData.name !== undefined ? fieldData.name : field.name;
  const address = fieldData.address !== undefined ? fieldData.address : field.address;
  const type = fieldData.type !== undefined ? fieldData.type : field.type;

  await checkDuplicateField(tenantId, name, address, type, id);

  return await field.update(fieldData);
};

const deleteField = async (id, tenantId) => {
  const field = await Field.findOne({ where: { id, tenant_id: tenantId } });
  if (!field) throw { status: 404, message: "Không tìm thấy sân!" };

  await field.destroy();
  return { message: "Đã xóa sân thành công" };
};

const restoreField = async (id, tenantId) => {

  const field = await Field.findOne({
    where: { id, tenant_id: tenantId },
    paranoid: false,
  });

  if (!field) throw { status: 404, message: "Không tìm thấy sân!" };

  await checkDuplicateField(tenantId, field.name, field.address, field.type, id);

  await field.restore(); // Lệnh khôi phục thần thánh của Sequelize
  return { message: "Đã khôi phục sân thành công" };
};

module.exports = {
  getFieldsByTenant,
  createField,
  updateField,
  deleteField,
  restoreField,
};
