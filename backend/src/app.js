const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/database");
const { sequelize } = require("./models/index");
const tenantMiddleware = require("./middlewares/tenant.middleware");
const authRoutes = require("./routes/auth.route");
const tenantRoutes = require("./routes/tenant.route");
const fieldRoutes = require("./routes/field.route");
const staffRoutes = require("./routes/staff.route");
const publicRoutes = require("./routes/public.route");
const bookingRoutes = require("./routes/booking.route");
const planRoutes = require("./routes/plan.route");
const paymentRoutes = require("./routes/payment.route");
const statisticRoutes = require("./routes/statistic.route");
const subscriptionRoutes = require("./routes/subscription.route");
const customerRoutes = require("./routes/customer.route");
const profileRoutes = require("./routes/profile.route");
const uploadRoutes = require("./routes/upload.route");
const { checkSubscription } = require("./middlewares/subscription.middleware");

// Khởi tạo các cron jobs
require("./cron/subscription.cron");
require("./cron/booking.cron");

const path = require("path");

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(cors());
app.use(express.json());

app.use(tenantMiddleware);
app.use(checkSubscription);

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/staffs", staffRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/statistics", statisticRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/test-domain", (req, res) => {
  if (req.isSuperAdminSite) {
    return res.json({
      message: "Chào mừng đến với trang quản trị tối cao (Super Admin)!",
    });
  }

  res.json({
    message: "Chào mừng bạn đến với sân bóng",
    tenant_id: req.tenantId,
    tenant_info: req.tenantData,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();

  await sequelize.sync();

  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
