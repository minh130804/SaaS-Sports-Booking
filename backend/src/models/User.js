const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false }, // BẮT BUỘC KHÔNG ĐƯỢC NULL
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    full_name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    role: {
      type: DataTypes.ENUM("OWNER", "STAFF", "CUSTOMER"), // Đã bỏ SUPER_ADMIN
      allowNull: false,
    },
  },
  { 
    tableName: "users", 
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['username', 'tenant_id']
      }
    ]
  },
);

module.exports = User;
