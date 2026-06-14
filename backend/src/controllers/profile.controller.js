const profileService = require("../services/profile.service");

const getMyProfile = async (req, res) => {
  try {
    const user = await profileService.getProfile(req.user.id);
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const user = await profileService.updateProfile(req.user.id, req.body, req.user.tenant_id);
    res.status(200).json({ message: "Cập nhật thành công", data: user });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = { getMyProfile, updateMyProfile };
