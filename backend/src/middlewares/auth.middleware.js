const jwt = require("jsonwebtoken");
const { User, Admin } = require("../models"); // Đã thêm Admin

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Bạn chưa đăng nhập! Vui lòng gửi kèm Token." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let currentUser = null;

    if (decoded.role === "SUPER_ADMIN") {
      currentUser = await Admin.findByPk(decoded.id);
    } else {
      currentUser = await User.findByPk(decoded.id);
    }

    if (!currentUser) {
      return res
        .status(401)
        .json({
          message: "Tài khoản liên kết với Token này không còn tồn tại.",
        });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error("Lỗi xác thực Token:", error);
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};

const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện hành động này!",
      });
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
