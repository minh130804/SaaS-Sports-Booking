const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Plan = sequelize.define(
  "Plan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }, // VD: Gói Free, Gói Cơ Bản, Gói Pro
    max_fields: { type: DataTypes.INTEGER, allowNull: false }, // Giới hạn số sân tối đa
    max_staffs: { type: DataTypes.INTEGER, allowNull: false }, // Giới hạn số nhân viên tối đa
    monthly_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    yearly_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  { tableName: "plans", timestamps: true, paranoid: true },
);

module.exports = Plan;
