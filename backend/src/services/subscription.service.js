const { Tenant, Plan, TenantPayment } = require("../models");
const { createPaymentUrl, verifyReturnUrl } = require("../utils/vnpay.util");

const ADMIN_VNPAY_CONFIG = {
  tmnCode: process.env.ADMIN_VNPAY_TMN_CODE || process.env.VNPAY_TMN_CODE || "9TSH0GIZ",
  hashSecret: process.env.ADMIN_VNPAY_HASH_SECRET || process.env.VNPAY_HASH_SECRET || "2X4Z1LIUMNXVOH6FER8UTO00HNTU9V3G",
  url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl: process.env.ADMIN_VNPAY_RETURN_URL || "http://localhost:8000/api/subscriptions/vnpay-return",
};

const sendSuccessEmail = async (tenant, payment) => {
  try {
    const { User, Plan } = require("../models");
    const emailService = require("./email.service");
    const owner = await User.findOne({ where: { tenant_id: tenant.id, role: "OWNER" } });
    const plan = await Plan.findByPk(payment.plan_id);
    if (owner && owner.email) {
      const formattedDate = new Date(tenant.subscription_end_date).toLocaleDateString("vi-VN");
      await emailService.sendSubscriptionSuccess(owner.email, tenant.name, plan.name, payment.amount, formattedDate);
    }
  } catch (err) {
    console.error("Lỗi gửi email gia hạn:", err);
  }
};

const createSubscriptionPayment = async (tenantId, planId, billingCycle, ipAddr) => {
  const tenant = await Tenant.findByPk(tenantId);
  const plan = await Plan.findByPk(planId);

  if (!tenant || !plan) throw { status: 404, message: "Không tìm thấy thông tin gói cước hoặc chủ sân!" };
  
  const { Field, User } = require("../models");
  const fieldCount = await Field.count({ where: { tenant_id: tenantId } });
  const staffCount = await User.count({ where: { tenant_id: tenantId, role: "STAFF" } });

  if (fieldCount > plan.max_fields || staffCount > plan.max_staffs) {
    throw { 
      status: 400, 
      message: `Không thể đăng ký! Hệ thống của bạn đang có ${fieldCount} sân và ${staffCount} nhân viên. Gói cước "${plan.name}" chỉ cho phép tối đa ${plan.max_fields} sân và ${plan.max_staffs} nhân viên. Vui lòng xoá bớt trước khi thanh toán.` 
    };
  }

  const amount = billingCycle === "YEARLY" ? plan.yearly_price : plan.monthly_price;

  const payment = await TenantPayment.create({
    tenant_id: tenant.id,
    plan_id: plan.id,
    billing_cycle: billingCycle,
    amount: amount,
    status: "PENDING",
  });

  const orderInfo = `Thanh toan goi cuoc ${plan.name} - ${billingCycle}`;
  const paymentUrl = createPaymentUrl(amount, orderInfo, payment.id, ipAddr, ADMIN_VNPAY_CONFIG);

  payment.vnpay_txn_ref = payment.id.toString();
  await payment.save();

  return paymentUrl;
};

const handleVnPayReturn = async (vnpParams) => {
  const isSecure = verifyReturnUrl(vnpParams, ADMIN_VNPAY_CONFIG);
  if (!isSecure) throw { status: 400, message: "Chữ ký không hợp lệ" };

  const txnRef = vnpParams["vnp_TxnRef"];
  const responseCode = vnpParams["vnp_ResponseCode"];

  const payment = await TenantPayment.findByPk(txnRef);
  if (!payment) throw { status: 404, message: "Không tìm thấy giao dịch" };

  if (responseCode === "00") {

    if (payment.status === "PENDING") {
      payment.status = "SUCCESS";
      await payment.save();

      const tenant = await Tenant.findByPk(payment.tenant_id);
      tenant.plan_id = payment.plan_id;
      
      const now = new Date();
      if (!tenant.subscription_end_date || tenant.subscription_end_date < now) {
        tenant.subscription_end_date = new Date(now.setMonth(now.getMonth() + (payment.billing_cycle === "YEARLY" ? 12 : 1)));
      } else {
        const endDate = new Date(tenant.subscription_end_date);
        tenant.subscription_end_date = new Date(endDate.setMonth(endDate.getMonth() + (payment.billing_cycle === "YEARLY" ? 12 : 1)));
      }

      // MỚI: Snapshot lại giới hạn của gói cước vào thời điểm gia hạn thành công
      const plan = await Plan.findByPk(payment.plan_id);
      if (plan) {
        tenant.current_max_fields = plan.max_fields;
        tenant.current_max_staffs = plan.max_staffs;
      }

      tenant.subscription_status = "ACTIVE";
      await tenant.save();
      await sendSuccessEmail(tenant, payment);
    }
    return { success: true, payment };
  } else {
    if (payment.status === "PENDING") {
      payment.status = "FAILED";
      await payment.save();
    }
    return { success: false, payment };
  }
};

const handleVnPayIpn = async (vnpParams) => {
  const isSecure = verifyReturnUrl(vnpParams, ADMIN_VNPAY_CONFIG);
  if (!isSecure) return { RspCode: "97", Message: "Checksum failed" };

  const txnRef = vnpParams["vnp_TxnRef"];
  const responseCode = vnpParams["vnp_ResponseCode"];

  const payment = await TenantPayment.findByPk(txnRef);
  if (!payment) return { RspCode: "01", Message: "Order not found" };

  if (payment.status !== "PENDING") {
    return { RspCode: "02", Message: "Order already confirmed" };
  }

  if (responseCode === "00") {
    payment.status = "SUCCESS";
    await payment.save();

    const tenant = await Tenant.findByPk(payment.tenant_id);
    tenant.plan_id = payment.plan_id;
    
    const now = new Date();
    if (!tenant.subscription_end_date || tenant.subscription_end_date < now) {
      tenant.subscription_end_date = new Date(now.setMonth(now.getMonth() + (payment.billing_cycle === "YEARLY" ? 12 : 1)));
    } else {
      const endDate = new Date(tenant.subscription_end_date);
      tenant.subscription_end_date = new Date(endDate.setMonth(endDate.getMonth() + (payment.billing_cycle === "YEARLY" ? 12 : 1)));
    }
    
    // MỚI: Snapshot lại giới hạn của gói cước vào thời điểm gia hạn thành công
    const plan = await Plan.findByPk(payment.plan_id);
    if (plan) {
      tenant.current_max_fields = plan.max_fields;
      tenant.current_max_staffs = plan.max_staffs;
    }

    tenant.subscription_status = "ACTIVE";
    await tenant.save();
    await sendSuccessEmail(tenant, payment);
  } else {
    payment.status = "FAILED";
    await payment.save();
  }

  return { RspCode: "00", Message: "Confirm Success" };
};

const getSubscriptionPayments = async () => {
  return await TenantPayment.findAll({
    include: [
      { model: Tenant, attributes: ["name", "custom_domain"] },
      { model: Plan, attributes: ["name"], paranoid: false },
    ],
    order: [["createdAt", "DESC"]],
  });
};

module.exports = {
  createSubscriptionPayment,
  handleVnPayReturn,
  handleVnPayIpn,
  getSubscriptionPayments,
};
