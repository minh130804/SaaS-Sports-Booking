const bcrypt = require("bcryptjs");
const { connectDB } = require("../config/database");
const { Tenant, User, Field } = require("../models");

const seedTestTenant = async () => {
  try {
    await connectDB();

    await Field.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Tenant.destroy({ where: {}, force: true });

    const tenant = await Tenant.create({
      id: 1,
      name: "Sân bóng Sài Gòn",
      custom_domain: "sanco",
      plan_id: 1, // Free plan
    });
    console.log("✅ Created tenant sanco");

    const hashedOwnerPassword = await bcrypt.hash("123456", 10);
    const owner = await User.create({
      tenant_id: tenant.id,
      username: "minh123",
      password: hashedOwnerPassword,
      full_name: "Lê Quang Minh",
      phone: "0987654321",
      role: "OWNER",
    });
    console.log("✅ Created owner minh123");

    const hashedCustomerPassword = await bcrypt.hash("123456", 10);
    const customer = await User.create({
      tenant_id: tenant.id,
      username: "customer123",
      password: hashedCustomerPassword,
      full_name: "Khách hàng A",
      phone: "0123456789",
      role: "CUSTOMER",
    });
    console.log("✅ Created customer customer123");

    const field = await Field.create({
      id: 1,
      tenant_id: tenant.id,
      name: "Sân Số 1",
      type: "Bóng đá - Sân 7 người",
      address: "123 Nguyễn Trãi",
      pricing: [
        { start: "05:00", end: "17:00", price: 100000 },
        { start: "17:00", end: "22:00", price: 150000 }
      ],
      status: "AVAILABLE",
    });
    console.log("✅ Created field Sân Số 1");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding test tenant:", error);
    process.exit(1);
  }
};

seedTestTenant();
