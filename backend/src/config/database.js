const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // Cập nhật dòng này để đọc cổng 3307
    dialect: "mysql",
    logging: false, // Tắt log query để terminal sạch sẽ
  },
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối MySQL thành công!");
  } catch (error) {
    console.error("❌ Lỗi kết nối MySQL:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
