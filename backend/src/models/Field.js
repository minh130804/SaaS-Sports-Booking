const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Field = sequelize.define(
  "Field",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false }, // MỚI: Địa chỉ của sân
    pricing: { type: DataTypes.JSON, allowNull: false }, // MỚI: Lưu giá theo khung giờ dạng JSON
    status: {
      type: DataTypes.ENUM("AVAILABLE", "MAINTENANCE"),
      defaultValue: "AVAILABLE",
    },
  },
  {
    tableName: "fields",
    timestamps: true,
    paranoid: true, // MỚI: Bật tính năng XÓA MỀM. Khi gọi hàm xóa, nó sẽ không xóa hẳn mà lưu ngày xóa vào cột deletedAt
  },
);

module.exports = Field;
