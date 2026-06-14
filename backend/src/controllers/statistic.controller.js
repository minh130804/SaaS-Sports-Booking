const statisticService = require("../services/statistic.service");

const getOwnerRevenue = async (req, res) => {
  try {
    const data = await statisticService.getOwnerRevenue(
      req.user.tenant_id,
      req.query.year,
    );
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi tải thống kê doanh thu" });
  }
};

const getAdminRevenue = async (req, res) => {
  try {
    const data = await statisticService.getAdminRevenue(req.query.year);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi tải thống kê doanh thu Admin" });
  }
};

module.exports = {
  getOwnerRevenue,
  getAdminRevenue,
};
