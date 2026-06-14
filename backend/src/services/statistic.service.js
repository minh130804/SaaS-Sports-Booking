const { Booking, Tenant, Plan } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

const getOwnerRevenue = async (tenantId, year) => {
  const targetYear = year || new Date().getFullYear();

  const query = `
    SELECT 
      MONTH(booking_date) as month,
      SUM(total_price) as revenue
    FROM bookings
    WHERE tenant_id = :tenantId
      AND YEAR(booking_date) = :year
      AND status IN ('CONFIRMED', 'COMPLETED')
    GROUP BY MONTH(booking_date)
    ORDER BY month ASC
  `;

  const results = await sequelize.query(query, {
    replacements: { tenantId, year: targetYear },
    type: sequelize.QueryTypes.SELECT,
  });

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    name: `Tháng ${i + 1}`,
    revenue: 0,
  }));

  results.forEach(row => {
    monthlyData[row.month - 1].revenue = Number(row.revenue);
  });

  return monthlyData;
};

const getAdminRevenue = async (year) => {
  const targetYear = year || new Date().getFullYear();

  const query = `
    SELECT 
      MONTH(createdAt) as month,
      SUM(amount) as revenue
    FROM tenant_payments
    WHERE YEAR(createdAt) = :year AND status = 'SUCCESS'
    GROUP BY MONTH(createdAt)
    ORDER BY month ASC
  `;

  const results = await sequelize.query(query, {
    replacements: { year: targetYear },
    type: sequelize.QueryTypes.SELECT,
  });

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    name: `Tháng ${i + 1}`,
    revenue: 0,
  }));

  results.forEach(row => {
    monthlyData[row.month - 1].revenue = Number(row.revenue);
  });

  return monthlyData;
};

module.exports = {
  getOwnerRevenue,
  getAdminRevenue,
};
