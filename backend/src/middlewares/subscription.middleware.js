const checkSubscription = async (req, res, next) => {

  if (req.isSuperAdminSite && (!req.user || !req.user.tenant_id)) {
    return next();
  }

  if (req.user && req.user.role === "SUPER_ADMIN") {
    return next();
  }

  const allowedPaths = [
    "/api/auth/",
    "/api/subscriptions/",
    "/api/public/",
    "/api/payments/",
    "/api/plans",
    "/api/tenants/my-plan",
    "/api/test-domain"
  ];
  const isAllowedPath = allowedPaths.some(path => req.originalUrl.includes(path));
  if (isAllowedPath) {
    return next();
  }

  let tenant = req.tenantData;
  if (!tenant && req.user && req.user.tenant_id) {
    const { Tenant } = require("../models");
    tenant = await Tenant.findByPk(req.user.tenant_id);
  }

  if (tenant) {
    const isExpired = tenant.subscription_end_date && new Date(tenant.subscription_end_date) < new Date();
    if (isExpired) {
      return res.status(403).json({ 
        code: "TENANT_EXPIRED",
        message: "Hệ thống đang bị khoá do gói cước đã hết hạn. Vui lòng thanh toán gia hạn để mở lại." 
      });
    }
  }

  next();
};

module.exports = { checkSubscription };
