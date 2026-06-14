const subscriptionService = require("../services/subscription.service");

const createPaymentUrl = async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip;

    const paymentUrl = await subscriptionService.createSubscriptionPayment(
      req.user.tenant_id,
      planId,
      billingCycle,
      ipAddr
    );

    res.status(200).json({ paymentUrl });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Lỗi tạo link thanh toán" });
  }
};

const vnpayReturn = async (req, res) => {
  try {
    const result = await subscriptionService.handleVnPayReturn(req.query);

    const { Tenant } = require("../models");
    const tenant = await Tenant.findByPk(result.payment.tenant_id);
    
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    
    if (result.success) {
      res.redirect(`${frontendUrl}/${tenant.custom_domain}/owner/subscription-result?status=success`);
    } else {
      res.redirect(`${frontendUrl}/${tenant.custom_domain}/owner/subscription-result?status=failed`);
    }
  } catch (error) {
    console.error("Lỗi VNPay Return:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/admin/login?error=vnpay_return`);
  }
};

const vnpayIpn = async (req, res) => {
  try {
    const result = await subscriptionService.handleVnPayIpn(req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi VNPay IPN:", error);
    res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

const getSubscriptionPayments = async (req, res) => {
  try {
    const payments = await subscriptionService.getSubscriptionPayments();
    res.status(200).json({ data: payments });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải lịch sử thanh toán" });
  }
};

module.exports = {
  createPaymentUrl,
  vnpayReturn,
  vnpayIpn,
  getSubscriptionPayments,
};
