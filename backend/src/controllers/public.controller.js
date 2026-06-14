const publicService = require("../services/public.service");

const getFields = async (req, res) => {
  try {
    const result = await publicService.getFieldsByDomain(req.params.domain);
    res.status(200).json({ data: result.fields, tenant: result.tenant });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

module.exports = { getFields };
