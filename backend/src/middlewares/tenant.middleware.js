const Tenant = require("../models/Tenant");

const tenantMiddleware = async (req, res, next) => {
  try {

    let host = req.headers.host;

    if (host.includes(":")) {
      host = host.split(":")[0];
    }

    if (host === "admin.hethong.com" || host === "localhost") {
      req.isSuperAdminSite = true;
      return next();
    }

    const tenant = await Tenant.findOne({
      where: { custom_domain: host, status: "ACTIVE" },
    });

    if (!tenant) {
      return res
        .status(404)
        .json({
          message: "Không tìm thấy hệ thống hoặc tên miền chưa được cấu hình.",
        });
    }

    req.tenantId = tenant.id;
    req.tenantData = tenant;

    next();
  } catch (error) {
    console.error("Lỗi Tenant Middleware:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports = tenantMiddleware;
