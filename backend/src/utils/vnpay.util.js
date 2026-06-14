const crypto = require("crypto");
const qs = require("qs");
require("dotenv").config();

const VNPAY_CONFIG = {
  tmnCode: process.env.VNPAY_TMN_CODE?.trim() || "9TSH0GIZ",
  hashSecret: process.env.VNPAY_HASH_SECRET?.trim() || "2X4Z1LIUMNXVOH6FER8UTO00HNTU9V3G",
  url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl: process.env.VNPAY_RETURN_URL?.trim() || "http://localhost:8000/api/payments/vnpay-return",
};

function removeAccents(str) {
  return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-zA-Z0-9 ]/g, "");
}

function sortObject(obj) {
  let sorted = {};
  let str = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

function getVnTime() {
  const date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const yyyy = date.getFullYear().toString();
  const MM = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const HH = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  
  const createDate = yyyy + MM + dd + HH + mm + ss;

  date.setMinutes(date.getMinutes() + 15);
  const eyyyy = date.getFullYear().toString();
  const eMM = (date.getMonth() + 1).toString().padStart(2, '0');
  const edd = date.getDate().toString().padStart(2, '0');
  const eHH = date.getHours().toString().padStart(2, '0');
  const emm = date.getMinutes().toString().padStart(2, '0');
  const ess = date.getSeconds().toString().padStart(2, '0');
  const expireDate = eyyyy + eMM + edd + eHH + emm + ess;

  return { createDate, expireDate };
}

function createPaymentUrl(amount, orderInfo, txnRef, clientIp = "127.0.0.1", customConfig = null) {
  const config = customConfig || VNPAY_CONFIG;
  const { createDate, expireDate } = getVnTime();

  const safeAmount = parseInt(String(amount).replace(/,/g, ''), 10);

  const cleanOrderInfo = removeAccents(orderInfo || "Thanh toan don hang");

  let ipAddr = clientIp === "::1" || clientIp === "::ffff:127.0.0.1" || !clientIp ? "127.0.0.1" : clientIp;

  let vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: String(safeAmount * 100),
    vnp_CurrCode: "VND",
    vnp_TxnRef: String(txnRef),
    vnp_OrderInfo: cleanOrderInfo, 
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: ipAddr, 
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  vnpParams = sortObject(vnpParams);

  const signData = qs.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac("sha512", config.hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnpParams["vnp_SecureHash"] = signed;
  return config.url + "?" + qs.stringify(vnpParams, { encode: false });
}

function verifyReturnUrl(vnpParams, customConfig = null) {
  const config = customConfig || VNPAY_CONFIG;
  const secureHash = vnpParams["vnp_SecureHash"];
  let paramsToSign = { ...vnpParams };
  
  delete paramsToSign["vnp_SecureHash"];
  delete paramsToSign["vnp_SecureHashType"];

  paramsToSign = sortObject(paramsToSign);
  const signData = qs.stringify(paramsToSign, { encode: false });
  
  const hmac = crypto.createHmac("sha512", config.hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return secureHash === signed;
}

module.exports = { createPaymentUrl, verifyReturnUrl };