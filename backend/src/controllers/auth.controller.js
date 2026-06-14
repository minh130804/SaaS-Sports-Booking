const authService = require("../services/auth.service");

const loginAdmin = async (req, res) => {
  try {
    const result = await authService.adminLogin(
      req.body.username,
      req.body.password,
    );
    res.status(200).json({ message: "Đăng nhập Admin thành công", ...result });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const loginTenant = async (req, res) => {
  try {
    const result = await authService.tenantLogin(
      req.body.username,
      req.body.password,
      req.body.domain,
    );
    res.status(200).json({ message: "Đăng nhập thành công", ...result });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const registerTenant = async (req, res) => {
  try {
    const { username, password, full_name, phone, domain, email } = req.body;
    const result = await authService.tenantRegister(
      username,
      password,
      full_name,
      phone,
      domain,
      email
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const tenantForgotPassword = async (req, res) => {
  try {
    const { email, domain } = req.body;
    if (!email) throw { status: 400, message: "Vui lòng nhập email!" };
    const result = await authService.tenantForgotPassword(email, domain);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = { loginAdmin, loginTenant, registerTenant, tenantForgotPassword };
