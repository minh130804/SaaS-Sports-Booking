const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendInvoiceEmail = async (userEmail, bookingDetails) => {
  if (!userEmail) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Xác nhận đặt sân thành công - ${bookingDetails.tenantName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #10b981; padding: 20px; text-align: center; color: white;">
          <h2>Xác nhận Đặt Sân Thành Công</h2>
        </div>
        <div style="padding: 20px;">
          <p>Xin chào <b>${bookingDetails.customerName}</b>,</p>
          <p>Cảm ơn bạn đã đặt sân tại <b>${bookingDetails.tenantName}</b>. Dưới đây là thông tin chi tiết đơn đặt sân của bạn:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><b>Mã đặt sân:</b></td>
              <td style="padding: 10px; border: 1px solid #ddd;">#${bookingDetails.id}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><b>Sân:</b></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${bookingDetails.fieldName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><b>Ngày thi đấu:</b></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${bookingDetails.date}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><b>Khung giờ:</b></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${bookingDetails.time}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><b>Phương thức TT:</b></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${bookingDetails.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><b>Tổng tiền:</b></td>
              <td style="padding: 10px; border: 1px solid #ddd; color: #dc2626; font-weight: bold;">${bookingDetails.price.toLocaleString('vi-VN')} VNĐ</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">Vui lòng đưa email này cho nhân viên quản lý khi bạn đến nhận sân.</p>
          <p>Chúc bạn có một trận đấu tuyệt vời!</p>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          Hệ thống Quản lý Sân bóng - SaaS Sports Booking
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Đã gửi hoá đơn tới ${userEmail}`);
  } catch (error) {
    console.error(`[Email] Lỗi khi gửi hoá đơn tới ${userEmail}:`, error);
  }
};

const sendNewBookingToOwner = async (ownerEmail, bookingDetails) => {
  if (!ownerEmail) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ownerEmail,
    subject: `[Thông báo mới] Có khách vừa đặt sân!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #3b82f6; padding: 20px; text-align: center; color: white;">
          <h2>Đơn Đặt Sân Mới</h2>
        </div>
        <div style="padding: 20px;">
          <p>Xin chào,</p>
          <p>Bạn vừa nhận được một đơn đặt sân mới từ khách hàng <b>${bookingDetails.customerName}</b>.</p>
          
          <ul>
            <li><b>Mã đơn:</b> #${bookingDetails.id}</li>
            <li><b>Số điện thoại:</b> ${bookingDetails.customerPhone || "Không có"}</li>
            <li><b>Sân:</b> ${bookingDetails.fieldName}</li>
            <li><b>Ngày thi đấu:</b> ${bookingDetails.date}</li>
            <li><b>Khung giờ:</b> ${bookingDetails.time}</li>
            <li><b>Thanh toán:</b> ${bookingDetails.paymentMethod} - ${bookingDetails.price.toLocaleString('vi-VN')} VNĐ</li>
          </ul>

          <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Đã gửi thông báo đơn mới tới Chủ sân ${ownerEmail}`);
  } catch (error) {
    console.error(`[Email] Lỗi khi gửi thông báo tới Chủ sân ${ownerEmail}:`, error);
  }
};

const sendSubscriptionReminder = async (ownerEmail, tenantName, endDate) => {
  if (!ownerEmail) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ownerEmail,
    subject: `[Quan trọng] Nhắc nhở gia hạn gói cước hệ thống`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f87171; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #ef4444; padding: 20px; text-align: center; color: white;">
          <h2>Gói Cước Sắp Hết Hạn!</h2>
        </div>
        <div style="padding: 20px;">
          <p>Xin chào chủ hệ thống <b>${tenantName}</b>,</p>
          <p>Chúng tôi xin thông báo rằng gói cước dịch vụ quản lý sân bóng của bạn sẽ hết hạn vào ngày <b>${endDate}</b>.</p>
          <p>Sau thời gian này, hệ thống sẽ chuyển sang chế độ <b>Chỉ Xem (Read-only)</b>, và khách hàng sẽ không thể đặt sân online được nữa.</p>
          <p>Vui lòng đăng nhập vào hệ thống, truy cập mục <b>Gói cước & Thanh toán</b> để tiến hành gia hạn và đảm bảo hoạt động kinh doanh không bị gián đoạn.</p>
          <br/>
          <p>Trân trọng,<br/>Đội ngũ hỗ trợ SaaS Sports Booking</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Đã gửi nhắc nhở hết hạn tới Chủ sân ${ownerEmail}`);
  } catch (error) {
    console.error(`[Email] Lỗi khi gửi nhắc nhở hết hạn tới Chủ sân ${ownerEmail}:`, error);
  }
};

const sendSubscriptionSuccess = async (ownerEmail, tenantName, planName, amount, newEndDate) => {
  if (!ownerEmail) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ownerEmail,
    subject: `[Biên lai] Thanh toán Gói cước thành công - ${tenantName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #10b981; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #10b981; padding: 20px; text-align: center; color: white;">
          <h2>Thanh toán Gói cước Thành công</h2>
        </div>
        <div style="padding: 20px;">
          <p>Xin chào chủ hệ thống <b>${tenantName}</b>,</p>
          <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi. Bạn vừa thanh toán / gia hạn thành công gói cước quản lý sân bóng.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><b>Gói cước:</b></td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><b>Số tiền đã thanh toán:</b></td>
              <td style="padding: 10px; border: 1px solid #ddd; color: #dc2626; font-weight: bold;">${amount.toLocaleString('vi-VN')} VNĐ</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><b>Thời hạn mới:</b></td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${newEndDate}</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">Hệ thống của bạn đã được kích hoạt/gia hạn. Bạn có thể tiếp tục quản lý sân bóng ngay bây giờ.</p>
          <br/>
          <p>Trân trọng,<br/>Đội ngũ hỗ trợ SaaS Sports Booking</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Đã gửi biên lai gói cước tới Chủ sân ${ownerEmail}`);
  } catch (error) {
    console.error(`[Email] Lỗi khi gửi biên lai tới Chủ sân ${ownerEmail}:`, error);
  }
};

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Đã gửi email tới ${to}`);
  } catch (error) {
    console.error(`[Email] Lỗi khi gửi email tới ${to}:`, error);
  }
};

module.exports = {
  sendInvoiceEmail,
  sendNewBookingToOwner,
  sendSubscriptionReminder,
  sendSubscriptionSuccess,
  sendEmail,
};
