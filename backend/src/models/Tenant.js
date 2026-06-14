const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Tenant = sequelize.define(
  "Tenant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    custom_domain: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
    subscription_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    subscription_status: {
      type: DataTypes.ENUM("ACTIVE", "EXPIRED", "PENDING"),
      defaultValue: "ACTIVE",
    },
    current_max_fields: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    current_max_staffs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    open_time: {
      type: DataTypes.STRING,
      defaultValue: "06:00",
      allowNull: true,
    },
    close_time: {
      type: DataTypes.STRING,
      defaultValue: "22:00",
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "tenants",
    timestamps: true,
  },
);

module.exports = Tenant;
