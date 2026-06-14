const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Admin = sequelize.define(
  "Admin",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    full_name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: "SUPER_ADMIN" },
  },
  { tableName: "admins", timestamps: true },
);

module.exports = Admin;
