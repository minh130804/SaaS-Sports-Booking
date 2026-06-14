const bcrypt = require("bcryptjs");
const { connectDB } = require("../config/database");
const { Admin } = require("../models"); // Đổi từ User sang Admin
require("dotenv").config();

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await Admin.findOne({ where: { role: "SUPER_ADMIN" } });
    if (adminExists) {
      console.log("⚠️ Tài khoản Super Admin đã tồn tại!");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    await Admin.create({
      username: "admin",
      password: hashedPassword,
      full_name: "Quản trị viên Hệ thống",
      role: "SUPER_ADMIN",
    });

    console.log("✅ Đã tạo thành công tài khoản Super Admin!");
    console.log("Tài khoản: admin");
    console.log("Mật khẩu: admin123");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi tạo Admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();
