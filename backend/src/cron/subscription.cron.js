const cron = require('node-cron');
const { Tenant, User } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/email.service');

// Chạy vào 00:00 mỗi ngày
cron.schedule('0 0 * * *', async () => {
  console.log('[Cron] Đang kiểm tra các gói cước sắp hết hạn...');
  try {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    // Tìm các Tenant sắp hết hạn (trong vòng 3 ngày tới)
    const expiringTenants = await Tenant.findAll({
      where: {
        subscription_status: 'ACTIVE',
        subscription_end_date: {
          [Op.between]: [today, threeDaysLater]
        }
      }
    });

    for (const tenant of expiringTenants) {
      // Tìm chủ sân của Tenant này
      const owner = await User.findOne({
        where: { tenant_id: tenant.id, role: 'OWNER' }
      });

      if (owner && owner.email) {
        const formattedEndDate = tenant.subscription_end_date.toLocaleDateString('vi-VN');
        await emailService.sendSubscriptionReminder(owner.email, tenant.name, formattedEndDate);
      }
    }
    
    console.log(`[Cron] Đã kiểm tra xong. Có ${expiringTenants.length} hệ thống sắp hết hạn.`);
  } catch (error) {
    console.error('[Cron] Lỗi khi kiểm tra gói cước sắp hết hạn:', error);
  }
});

console.log('[Cron] Subscription reminder cron job initialized.');
