const { connectDB, sequelize } = require("../config/database");
const { Plan } = require("../models");

const seedPlans = async () => {
  try {
    await connectDB();

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    await Plan.destroy({ where: {}, truncate: true });

    await Plan.bulkCreate([
      {
        id: 1,
        name: "Gói Free",
        max_fields: 1,
        max_staffs: 1,
        monthly_price: 0,
        yearly_price: 0,
      },
      {
        id: 2,
        name: "Gói Cơ Bản",
        max_fields: 3,
        max_staffs: 3,
        monthly_price: 200000,
        yearly_price: 2000000,
      },
      {
        id: 3,
        name: "Gói Pro",
        max_fields: 999,
        max_staffs: 999,
        monthly_price: 500000,
        yearly_price: 5000000,
      },
    ]);

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Đã tạo thành công các gói cước mẫu!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    } catch (_) {}
    process.exit(1);
  }
};

seedPlans();
