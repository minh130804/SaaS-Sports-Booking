const { Field, Tenant } = require("../models");

const getFieldsByDomain = async (domain) => {
  const tenant = await Tenant.findOne({ where: { custom_domain: domain } });
  if (!tenant) throw { status: 404, message: "Hệ thống sân không tồn tại!" };

  const isExpired = tenant.subscription_end_date && new Date(tenant.subscription_end_date) < new Date();

  const fields = await Field.findAll({
    where: { tenant_id: tenant.id },
    order: [["createdAt", "DESC"]],
  });

  return { 
    fields, 
    tenant: { 
      id: tenant.id, 
      name: tenant.name, 
      address: tenant.address,
      phone: tenant.phone,
      open_time: tenant.open_time,
      close_time: tenant.close_time,
      logo_url: tenant.logo_url,
      isExpired 
    } 
  };
};

module.exports = { getFieldsByDomain };
