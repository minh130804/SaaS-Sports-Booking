import React, { useState, useEffect } from 'react';
import { Typography, Button, DatePicker, message, Spin, Modal, Tag, Form, Input } from 'antd';
import { useParams, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { 
    CheckCircleOutlined, CalendarOutlined, InfoCircleOutlined, 
    CreditCardOutlined, SafetyCertificateOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../../api/axiosClient';

const { Title, Text } = Typography;

const FieldBooking = () => {
    const { domain } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const targetFieldId = searchParams.get('fieldId');
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

    if (!userInfo) return <Navigate to={`/${domain}/login`} replace />;
    if (userInfo.role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (userInfo.role === 'OWNER' || userInfo.role === 'STAFF') return <Navigate to={`/${domain}/dashboard`} replace />;

    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [timelineData, setTimelineData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [selectedFieldId, setSelectedFieldId] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState([]); 
    const [isBooking, setIsBooking] = useState(false);

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [pendingBookingInfo, setPendingBookingInfo] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchTimeline = async () => {
            setLoading(true);
            try {
                const dateStr = selectedDate.format('YYYY-MM-DD');
                let url = `/bookings/timeline/${domain}?date=${dateStr}`;
                if (targetFieldId) {
                    url += `&fieldId=${targetFieldId}`;
                }
                const response = await axiosClient.get(url);
                let data = response.data.data;
                if (targetFieldId) {
                    data = data.filter(f => f.fieldId === parseInt(targetFieldId));
                }
                setTimelineData(data);
                setSelectedSlots([]); 
                setSelectedFieldId(null);
            } catch (error) {
                message.error('Lỗi khi tải lịch sân!');
            } finally {
                setLoading(false);
            }
        };
        fetchTimeline();
    }, [domain, selectedDate, targetFieldId]);

    const handleSlotClick = (fieldId, slot) => {
        if (slot.isBooked || slot.isPast) return;

        if (selectedFieldId !== null && selectedFieldId !== fieldId) {
            message.warning("Bạn chỉ có thể chọn giờ liên tiếp trên cùng 1 sân. Đã reset lựa chọn!");
            setSelectedFieldId(fieldId);
            setSelectedSlots([slot]);
            return;
        }

        setSelectedFieldId(fieldId);
        const isAlreadySelected = selectedSlots.some(s => s.startTime === slot.startTime);
        
        if (isAlreadySelected) {
            const newSlots = selectedSlots.filter(s => s.startTime !== slot.startTime);
            setSelectedSlots(newSlots);
            if (newSlots.length === 0) setSelectedFieldId(null);
        } else {
            setSelectedSlots([...selectedSlots, slot]);
        }
    };

    const openConfirmModal = () => {
        if (selectedSlots.length === 0) return message.warning("Vui lòng chọn khung giờ!");
        
        const sortedSlots = [...selectedSlots].sort((a,b) => a.startTime.localeCompare(b.startTime));
        
        for (let i = 0; i < sortedSlots.length - 1; i++) {
            if (sortedSlots[i].endTime !== sortedSlots[i+1].startTime) {
                return message.error("Vui lòng chọn các khung giờ nối tiếp nhau!");
            }
        }

        const fieldName = timelineData.find(f => f.fieldId === selectedFieldId)?.fieldName;
        const totalCost = sortedSlots.reduce((sum, slot) => sum + slot.price, 0);

        setPendingBookingInfo({
            fieldName,
            sortedSlots,
            totalCost,
            fieldId: selectedFieldId,
            date: selectedDate.format('YYYY-MM-DD'),
            dateDisplay: selectedDate.format('DD/MM/YYYY'),
        });
        form.setFieldsValue({
            customer_name: userInfo.full_name,
            customer_phone: userInfo.phone || '',
        });
        setConfirmVisible(true);
    };

    const handleConfirmBooking = async () => {
        if (!pendingBookingInfo) return;
        
        try {
            const values = await form.validateFields();
            setIsBooking(true);
            const { sortedSlots, totalCost, fieldId, date } = pendingBookingInfo;
            const response = await axiosClient.post('/payments/create', {
                customer_name: values.customer_name,
                customer_phone: values.customer_phone,
                customer_email: values.customer_email,
                field_id: fieldId,
                booking_date: date,
                start_time: sortedSlots[0].startTime,
                end_time: sortedSlots[sortedSlots.length - 1].endTime,
                total_price: totalCost,
                payment_method: 'VNPAY',
            });

            if (response.data.paymentUrl) {
                message.loading('Đang chuyển đến cổng thanh toán VNPay...', 1.5);
                setConfirmVisible(false);
                setTimeout(() => {
                    window.location.href = response.data.paymentUrl;
                }, 1500);
            } else {
                message.error('Không nhận được URL thanh toán từ server!');
                setIsBooking(false);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi tạo đơn thanh toán!');
            setIsBooking(false);
        }
    };

    return (
        <div style={{ padding: '30px 50px', background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>

            <Modal
                open={confirmVisible}
                onCancel={() => !isBooking && setConfirmVisible(false)}
                footer={null}
                width={480}
                closable={!isBooking}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CheckCircleOutlined style={{ color: '#10b981', fontSize: 22 }} />
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                            Xác nhận đặt lịch & Thanh toán
                        </span>
                    </div>
                }
            >
                {pendingBookingInfo && (
                    <div style={{ padding: '8px 0' }}>

                        <div style={{ 
                            background: '#f8fafc', borderRadius: 12, padding: '16px 20px', 
                            marginBottom: 20, border: '1px solid #e2e8f0' 
                        }}>
                            <div style={{ marginBottom: 10, fontSize: 14, color: '#334155' }}>
                                <b>🏟️ Sân thi đấu:</b>&nbsp;
                                <Tag color="cyan" style={{ fontWeight: 600 }}>{pendingBookingInfo.fieldName}</Tag>
                            </div>
                            <div style={{ marginBottom: 10, fontSize: 14, color: '#334155' }}>
                                <b>📅 Ngày thi đấu:</b>&nbsp;{pendingBookingInfo.dateDisplay}
                            </div>
                            <div style={{ fontSize: 14, color: '#334155' }}>
                                <b>🕐 Khung giờ:</b>&nbsp;
                                <Tag color="blue" style={{ fontWeight: 600 }}>
                                    {pendingBookingInfo.sortedSlots[0].startTime} - {pendingBookingInfo.sortedSlots[pendingBookingInfo.sortedSlots.length - 1].endTime}
                                </Tag>
                            </div>
                        </div>

                        <Form form={form} layout="vertical" style={{ marginBottom: 20 }}>
                            <Form.Item 
                                label={<b style={{ color: '#334155' }}>Tên khách hàng</b>} 
                                name="customer_name" 
                                rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
                                style={{ marginBottom: 12 }}
                            >
                                <Input placeholder="Nhập tên người đặt sân" size="large" />
                            </Form.Item>
                            <Form.Item 
                                label={<b style={{ color: '#334155' }}>Số điện thoại</b>} 
                                name="customer_phone" 
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                                style={{ marginBottom: 12 }}
                            >
                                <Input placeholder="Nhập số điện thoại liên hệ" size="large" />
                            </Form.Item>
                            <Form.Item 
                                label={<b style={{ color: '#334155' }}>Email (Tùy chọn)</b>} 
                                name="customer_email" 
                                rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
                                style={{ marginBottom: 0 }}
                                extra={<span style={{ fontSize: 12 }}>Để nhận hoá đơn đặt sân</span>}
                            >
                                <Input placeholder="Nhập email để nhận biên lai" size="large" />
                            </Form.Item>
                        </Form>

                        <div style={{ 
                            background: 'linear-gradient(135deg, #fff7ed, #fef3c7)',
                            borderRadius: 12, padding: '14px 20px', marginBottom: 20,
                            border: '1px solid #fde68a',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <Text strong style={{ fontSize: 15, color: '#92400e' }}>💰 Tổng thanh toán:</Text>
                            <span style={{ color: '#dc2626', fontSize: 26, fontWeight: 800 }}>
                                {pendingBookingInfo.totalCost.toLocaleString('vi-VN')}đ
                            </span>
                        </div>

                        <div style={{ 
                            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                            borderRadius: 12, padding: '16px 20px', marginBottom: 24,
                            border: '2px solid #3b82f6',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <CreditCardOutlined style={{ fontSize: 28, color: '#1d4ed8' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        Thanh toán qua VNPay
                                        <SafetyCertificateOutlined style={{ color: '#2563eb', fontSize: 14 }} />
                                    </div>
                                    <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>
                                        Thẻ ATM | Visa/MasterCard | QR Code
                                    </div>
                                </div>
                                <img 
                                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png" 
                                    alt="VNPay" 
                                    style={{ height: 32, objectFit: 'contain' }}
                                    onError={e => e.target.style.display='none'}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <Button 
                                size="large"
                                onClick={() => setConfirmVisible(false)} 
                                disabled={isBooking}
                                style={{ borderRadius: 8, fontWeight: 600, minWidth: 90 }}
                            >
                                Hủy
                            </Button>
                            <Button 
                                type="primary" 
                                size="large"
                                loading={isBooking}
                                onClick={handleConfirmBooking}
                                icon={<CreditCardOutlined />}
                                style={{ 
                                    background: '#1d4ed8', borderColor: '#1d4ed8',
                                    fontWeight: 700, borderRadius: 8, minWidth: 180,
                                    boxShadow: '0 4px 14px rgba(29, 78, 216, 0.4)'
                                }}
                            >
                                {isBooking ? 'Đang xử lý...' : '🔒 Thanh toán VNPay'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                <Title level={2} style={{ color: '#0f172a', fontWeight: 800, marginBottom: 8 }}>Biểu Đồ Trống Sân</Title>
                <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 24 }}>
                    Kéo chuột hoặc click để chọn các khung giờ 30 phút liên tiếp.
                </Text>

                <div style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
                    background: 'white', padding: '16px 24px', borderRadius: 16, marginBottom: 24,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CalendarOutlined style={{ color: '#10b981', fontSize: 20 }} />
                            <DatePicker 
                                size="large"
                                value={selectedDate} 
                                onChange={(date) => setSelectedDate(date)} 
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: 160, borderRadius: 8, fontWeight: 600 }}
                            />
                        </div>

                        <div style={{ width: 1, height: 30, background: '#e2e8f0' }}></div>

                        <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#475569', fontWeight: 500 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 16, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4 }}></div> Trống</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 16, background: '#10b981', borderRadius: 4 }}></div> Đang chọn</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 16, background: '#f87171', borderRadius: 4 }}></div> Đã đặt</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 16, background: '#e2e8f0', borderRadius: 4 }}></div> Đã qua</div>
                        </div>
                    </div>

                    <div style={{ minWidth: 200, textAlign: 'right' }}>
                        {selectedSlots.length > 0 ? (
                            <Button 
                                type="primary" 
                                size="large" 
                                icon={<CreditCardOutlined />}
                                style={{ 
                                    background: '#1d4ed8', borderColor: '#1d4ed8', 
                                    fontWeight: 800, borderRadius: 8, 
                                    boxShadow: '0 4px 12px rgba(29, 78, 216, 0.35)' 
                                }} 
                                onClick={openConfirmModal}
                            >
                                ĐẶT SÂN & THANH TOÁN ({selectedSlots.reduce((s, slot) => s + slot.price, 0).toLocaleString('vi-VN')}đ)
                            </Button>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                                <InfoCircleOutlined /> Vui lòng chọn giờ
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ background: 'white', padding: 24, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', overflowX: 'auto' }}>
                    {loading ? <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div> : (
                        
                        <div style={{ minWidth: Math.max(1200, (timelineData[0]?.slots?.length || 0) * 50), border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>

                            <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', height: 48 }}>
                                <div style={{ width: 120, flexShrink: 0, borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}></div>
                                
                                <div style={{ display: 'flex', flex: 1 }}>
                                    {timelineData[0]?.slots.map((slot, i) => {
                                        const isLast = i === timelineData[0].slots.length - 1;
                                        return (
                                            <div key={i} style={{ flex: 1, position: 'relative' }}>
                                                <div style={{ position: 'absolute', bottom: 12, left: 0, transform: 'translateX(-50%)', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                                                    {slot.startTime}
                                                </div>
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 2, height: 8, background: '#10b981' }}></div>
                                                
                                                {isLast && (
                                                    <>
                                                        <div style={{ position: 'absolute', bottom: 12, right: 0, transform: 'translateX(50%)', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                                                            {slot.endTime}
                                                        </div>
                                                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 2, height: 8, background: '#10b981' }}></div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {timelineData.map(field => (
                                <div key={field.fieldId} style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
                                    
                                    <div style={{ width: 120, flexShrink: 0, paddingLeft: 16, background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                                        {field.fieldName}
                                    </div>
                                    
                                    <div style={{ display: 'flex', flex: 1 }}>
                                        {field.slots.map((slot, idx) => {
                                            const isSelected = selectedFieldId === field.fieldId && selectedSlots.some(s => s.startTime === slot.startTime);
                                            
                                            let bgColor = '#ffffff'; 
                                            if (slot.isAvailable === false) bgColor = '#cbd5e1'; // Xám đậm cho giờ nghỉ
                                            else if (slot.isPast) bgColor = '#f1f5f9';
                                            else if (slot.isBooked) bgColor = '#fca5a5';
                                            else if (isSelected) bgColor = '#10b981';
                                            
                                            return (
                                                <div 
                                                    key={idx}
                                                    onClick={() => {
                                                        if (slot.isAvailable !== false) handleSlotClick(field.fieldId, slot)
                                                    }}
                                                    title={slot.isAvailable === false ? `${slot.startTime} - ${slot.endTime} | Giờ nghỉ` : `${slot.startTime} - ${slot.endTime} | ${slot.price.toLocaleString('vi-VN')}đ`}
                                                    style={{
                                                        flex: 1, 
                                                        height: 50,
                                                        background: bgColor,
                                                        borderRight: '1px solid #f1f5f9',
                                                        cursor: (slot.isAvailable === false || slot.isBooked || slot.isPast) ? 'not-allowed' : 'pointer',
                                                        transition: 'background 0.15s ease',
                                                    }}
                                                ></div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FieldBooking;