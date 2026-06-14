const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Booking = sequelize.define(
  "Booking",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    field_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    booking_date: { type: DataTypes.DATEONLY, allowNull: false },
    start_time: { type: DataTypes.TIME, allowNull: false },
    end_time: { type: DataTypes.TIME, allowNull: false },
    total_price: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"),
      defaultValue: "PENDING",
    },

    payment_method: {
      type: DataTypes.ENUM("CASH", "VNPAY", "BANK_TRANSFER"),
      defaultValue: "CASH",
    },
    payment_status: {
      type: DataTypes.ENUM("UNPAID", "PAID", "REFUNDED"),
      defaultValue: "UNPAID",
    },

    vnpay_txn_ref: { type: DataTypes.STRING(50), allowNull: true },
  },
  {
    tableName: "bookings",
    timestamps: true,
  },
);

module.exports = Booking;

