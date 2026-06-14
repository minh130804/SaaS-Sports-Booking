const { User } = require("../models");

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "full_name", "phone", "email", "username", "createdAt"],
  });
  if (!user) throw { status: 404, message: "Không tìm thấy người dùng" };
  return user;
};

const updateProfile = async (userId, data, tenantId) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: "Không tìm thấy người dùng" };

  if (data.phone && data.phone !== user.phone) {
    const existing = await User.findOne({
      where: { phone: data.phone, tenant_id: tenantId },
    });
    if (existing) throw { status: 400, message: "Số điện thoại đã được sử dụng!" };
  }

  if (data.full_name !== undefined) user.full_name = data.full_name;
  if (data.phone !== undefined) user.phone = data.phone || null;
  if (data.email !== undefined) user.email = data.email || null;
  if (data.password) {
      if (!data.old_password) {
          throw { status: 400, message: "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới!" };
      }
      const bcrypt = require("bcryptjs");
      const isMatch = await bcrypt.compare(data.old_password, user.password);
      if (!isMatch) {
          throw { status: 400, message: "Mật khẩu hiện tại không đúng!" };
      }
      user.password = await bcrypt.hash(data.password, 10);
  }

  await user.save();
  return {
    id: user.id,
    full_name: user.full_name,
    phone: user.phone,
    email: user.email,
    username: user.username,
  };
};

module.exports = { getProfile, updateProfile };
