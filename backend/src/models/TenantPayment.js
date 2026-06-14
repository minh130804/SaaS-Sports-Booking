const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TenantPayment = sequelize.define(
  "TenantPayment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    billing_cycle: {
      type: DataTypes.ENUM("MONTHLY", "YEARLY"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
      defaultValue: "PENDING",
    },
    vnpay_txn_ref: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "tenant_payments",
    timestamps: true,
  }
);

module.exports = TenantPayment;
