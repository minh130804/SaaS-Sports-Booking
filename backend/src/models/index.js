const { sequelize } = require("../config/database");
const Plan = require("./Plan");
const Tenant = require("./Tenant");
const User = require("./User");
const Field = require("./Field");
const Booking = require("./Booking");
const Admin = require("./Admin");
const TenantPayment = require("./TenantPayment");

Plan.hasMany(Tenant, { foreignKey: "plan_id" });
Tenant.belongsTo(Plan, { foreignKey: "plan_id" });

Tenant.hasMany(User, { foreignKey: "tenant_id" });
User.belongsTo(Tenant, { foreignKey: "tenant_id" });

Tenant.hasMany(Field, { foreignKey: "tenant_id" });
Field.belongsTo(Tenant, { foreignKey: "tenant_id" });

Booking.belongsTo(Tenant, { foreignKey: "tenant_id" });
Tenant.hasMany(Booking, { foreignKey: "tenant_id" });

Booking.belongsTo(Field, { foreignKey: "field_id" });
Field.hasMany(Booking, { foreignKey: "field_id" });

Booking.belongsTo(User, { foreignKey: "user_id", as: "customer" });
User.hasMany(Booking, { foreignKey: "user_id" });

Tenant.hasMany(TenantPayment, { foreignKey: "tenant_id" });
TenantPayment.belongsTo(Tenant, { foreignKey: "tenant_id" });

Plan.hasMany(TenantPayment, { foreignKey: "plan_id" });
TenantPayment.belongsTo(Plan, { foreignKey: "plan_id" });

module.exports = {
  sequelize,
  Plan,
  Tenant,
  User,
  Admin,
  Field,
  Booking,
  TenantPayment,
};
