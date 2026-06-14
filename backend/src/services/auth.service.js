const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Admin, Tenant } = require("../models");

const adminLogin = async (username, password) => {
  const admin = await Admin.findOne({ where: { username } });

  if (!admin)
    throw { status: 400, message: "Sai tên đăng nhập hoặc mật khẩu!" };

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch)
    throw { status: 400, message: "Sai tên đăng nhập hoặc mật khẩu!" };

  const token = jwt.sign(
    { id: admin.id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  return {
    token,
    user: {
      id: admin.id,
      username: admin.username,
      full_name: admin.full_name,
      role: admin.role,
    },
  };
};

const tenantLogin = async (username, password, domain) => {
  const tenant = await Tenant.findOne({ where: { custom_domain: domain } });
  if (!tenant) throw { status: 404, message: "Hệ thống sân không tồn tại!" };

  const user = await User.findOne({
    where: { username, tenant_id: tenant.id },
  });

  if (!user) throw { status: 400, message: "Sai tên đăng nhập hoặc mật khẩu!" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    throw { status: 400, message: "Sai tên đăng nhập hoặc mật khẩu!" };

  const token = jwt.sign(
    { id: user.id, role: user.role, tenant_id: user.tenant_id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      domain: tenant.custom_domain,
    },
  };
};

const tenantRegister = async (username, password, full_name, phone, domain, email) => {
  const tenant = await Tenant.findOne({ where: { custom_domain: domain } });
  if (!tenant) throw { status: 404, message: "Hệ thống sân không tồn tại!" };

  const existingUser = await User.findOne({
    where: { username, tenant_id: tenant.id },
  });
  if (existingUser) throw { status: 400, message: "Tên đăng nhập đã tồn tại!" };

  if (email) {
    const existingEmail = await User.findOne({
      where: { email, tenant_id: tenant.id },
    });
    if (existingEmail) throw { status: 400, message: "Email đã được sử dụng!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    tenant_id: tenant.id,
    username,
    password: hashedPassword,
    full_name,
    phone,
    email: email || null,
    role: "CUSTOMER",
  });

  return { message: "Đăng ký tài khoản thành công!" };
};

const tenantForgotPassword = async (email, domain) => {
  const tenant = await Tenant.findOne({ where: { custom_domain: domain } });
  if (!tenant) throw { status: 404, message: "Hệ thống sân không tồn tại!" };

  const user = await User.findOne({
    where: { email, tenant_id: tenant.id },
  });

  if (!user) throw { status: 404, message: "Không tìm thấy tài khoản nào có email này!" };

  // Tạo mật khẩu ngẫu nhiên 6 ký tự
  const newPassword = Math.random().toString(36).slice(-6);
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  user.password = hashedPassword;
  await user.save();

  // Gửi email
  const emailService = require("./email.service");
  const emailContent = `
    <h2>Yêu cầu cấp lại mật khẩu</h2>
    <p>Chào ${user.full_name},</p>
    <p>Hệ thống sân <b>${domain}</b> đã tạo mật khẩu mới cho tài khoản của bạn.</p>
    <p>Tên đăng nhập: <b>${user.username}</b></p>
    <p>Mật khẩu mới của bạn là: <b>${newPassword}</b></p>
    <p>Vui lòng đăng nhập và đổi mật khẩu sớm nhất có thể để đảm bảo bảo mật.</p>
    <br/>
    <p>Trân trọng,<br/>Đội ngũ ${domain} Sports</p>
  `;

  await emailService.sendEmail(
    user.email,
    `[${domain} Sports] Cấp lại mật khẩu`,
    emailContent
  );

  return { message: "Mật khẩu mới đã được gửi đến email của bạn!" };
};

module.exports = { adminLogin, tenantLogin, tenantRegister, tenantForgotPassword };
