import React, { useState, useEffect } from 'react';
import { Typography, Button, DatePicker, message, Spin, Modal, Tag, Form, Input, Select, Card } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    CheckCircleOutlined, CalendarOutlined, InfoCircleOutlined, 
    CreditCardOutlined, MoneyCollectOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../../api/axiosClient';

const { Title, Text } = Typography;

const OfflineBooking = () => {
    const { domain } = useParams();
    const navigate = useNavigate();
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [timelineData, setTimelineData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [selectedFieldId, setSelectedFieldId] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState([]); 
    const [isBooking, setIsBooking] = useState(false);

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [pendingBookingInfo, setPendingBookingInfo] = useState(null);
    const [form] = Form.useForm();

    const [selectedType, setSelectedType] = useState(null);

    const availableTypes = [...new Set(timelineData.map(f => f.fieldType).filter(Boolean))];

    const fetchTimeline = async () => {
        setLoading(true);
        try {
            const dateStr = selectedDate.format('YYYY-MM-DD');
            let url = `/bookings/timeline/${domain}?date=${dateStr}`;
            const response = await axiosClient.get(url);
            setTimelineData(response.data.data);
            setSelectedSlots([]); 
            setSelectedFieldId(null);
            
            // Nếu đã tải xong mà chưa có selectedType, tự động chọn cái đầu tiên
            const types = [...new Set(response.data.data.map(f => f.fieldType).filter(Boolean))];
            if (!selectedType && types.length > 0) {
                setSelectedType(types[0]);
            }
        } catch (error) {
            message.error('Lỗi khi tải lịch sân!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeline();
    }, [domain, selectedDate]);

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
            customer_name: '',
            customer_phone: '',
            payment_method: 'CASH',
            payment_status: 'UNPAID',
        });
        setConfirmVisible(true);
    };

    const handleConfirmBooking = async () => {
        if (!pendingBookingInfo) return;
        
        try {
            const values = await form.validateFields();
            setIsBooking(true);
            const { sortedSlots, totalCost, fieldId, date } = pendingBookingInfo;
            
            await axiosClient.post('/bookings/offline', {
                customer_name: values.customer_name,
                customer_phone: values.customer_phone,
                customer_email: values.customer_email,
                field_id: fieldId,
                booking_date: date,
                start_time: sortedSlots[0].startTime,
                end_time: sortedSlots[sortedSlots.length - 1].endTime,
                total_price: totalCost,
                payment_method: values.payment_method,
                payment_status: values.payment_status,
            });

            message.success('Đặt sân hộ thành công!');
            setConfirmVisible(false);
            fetchTimeline(); 
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi tạo đơn đặt sân!');
        } finally {
            setIsBooking(false);
        }
    };

    const filteredTimeline = timelineData.filter(f => f.fieldType === selectedType);

    return (
        <div style={{ padding: '24px' }}>
            <Modal
                open={confirmVisible}
                onCancel={() => !isBooking && setConfirmVisible(false)}
                footer={null}
                width={480}
                closable={!isBooking}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MoneyCollectOutlined style={{ color: '#10b981', fontSize: 22 }} />
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                            Đặt sân tại quầy
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
                                style={{ marginBottom: 12 }}
                            >
                                <Input placeholder="Nhập số điện thoại liên hệ (nếu có)" size="large" />
                            </Form.Item>

                            <Form.Item 
                                label={<b style={{ color: '#334155' }}>Email (Tùy chọn)</b>} 
                                name="customer_email" 
                                rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
                                style={{ marginBottom: 12 }}
                                extra={<span style={{ fontSize: 12 }}>Để gửi hoá đơn cho khách</span>}
                            >
                                <Input placeholder="Nhập email khách hàng" size="large" />
                            </Form.Item>

                            <Form.Item 
                                label={<b style={{ color: '#334155' }}>Phương thức thanh toán</b>} 
                                name="payment_method" 
                                style={{ marginBottom: 12 }}
                            >
                                <Select size="large">
                                    <Select.Option value="CASH">Tiền mặt</Select.Option>
                                    <Select.Option value="BANK_TRANSFER">Chuyển khoản</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item 
                                label={<b style={{ color: '#334155' }}>Trạng thái thanh toán</b>} 
                                name="payment_status" 
                                style={{ marginBottom: 0 }}
                            >
                                <Select size="large">
                                    <Select.Option value="UNPAID">Chưa thanh toán</Select.Option>
                                    <Select.Option value="PAID">Đã thanh toán</Select.Option>
                                </Select>
                            </Form.Item>
                        </Form>

                        <div style={{ 
                            background: 'linear-gradient(135deg, #fff7ed, #fef3c7)',
                            borderRadius: 12, padding: '14px 20px', marginBottom: 20,
                            border: '1px solid #fde68a',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <Text strong style={{ fontSize: 15, color: '#92400e' }}>💰 Tổng thu:</Text>
                            <span style={{ color: '#dc2626', fontSize: 26, fontWeight: 800 }}>
                                {pendingBookingInfo.totalCost.toLocaleString('vi-VN')}đ
                            </span>
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
                                style={{ 
                                    background: '#10b981', borderColor: '#10b981',
                                    fontWeight: 700, borderRadius: 8, minWidth: 180,
                                }}
                            >
                                Xác nhận Đặt Sân
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
                <MoneyCollectOutlined style={{ fontSize: 28, color: '#10b981' }} />
                <Title level={3} style={{ margin: 0, color: '#0f172a' }}>Đặt Sân Tại Quầy</Title>
            </div>

            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 8, color: '#475569' }}>Ngày xem lịch:</Text>
                        <DatePicker 
                            size="large"
                            value={selectedDate} 
                            onChange={(date) => setSelectedDate(date)} 
                            format="DD/MM/YYYY"
                            allowClear={false}
                            style={{ width: 200, borderRadius: 8, fontWeight: 600 }}
                        />
                    </div>
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 8, color: '#475569' }}>Loại sân:</Text>
                        <Select 
                            size="large"
                            value={selectedType}
                            onChange={(val) => {
                                setSelectedType(val);
                                setSelectedSlots([]);
                                setSelectedFieldId(null);
                            }}
                            style={{ width: 200 }}
                            placeholder="Chọn loại sân"
                        >
                            {availableTypes.map(type => (
                                <Select.Option key={type} value={type}>{type}</Select.Option>
                            ))}
                        </Select>
                    </div>
                    
                    <div style={{ flex: 1, textAlign: 'right', alignSelf: 'flex-end' }}>
                        {selectedSlots.length > 0 ? (
                            <Button 
                                type="primary" 
                                size="large" 
                                style={{ 
                                    background: '#10b981', borderColor: '#10b981', 
                                    fontWeight: 800, borderRadius: 8, 
                                }} 
                                onClick={openConfirmModal}
                            >
                                TẠO ĐƠN ({selectedSlots.reduce((s, slot) => s + slot.price, 0).toLocaleString('vi-VN')}đ)
                            </Button>
                        ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#94a3b8', paddingBottom: 10 }}>
                                <InfoCircleOutlined /> Vui lòng chọn giờ
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {selectedType && (
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ 
                        display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexWrap: 'wrap', gap: 16,
                        background: '#f8fafc', padding: '16px 24px', borderRadius: 12, marginBottom: 24,
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#475569', fontWeight: 500 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 16, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4 }}></div> Trống</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 16, background: '#10b981', borderRadius: 4 }}></div> Đang chọn</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 16, background: '#fca5a5', borderRadius: 4 }}></div> Đã đặt</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 16, background: '#f1f5f9', borderRadius: 4 }}></div> Đã qua</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 16, background: '#cbd5e1', borderRadius: 4 }}></div> Giờ nghỉ</div>
                        </div>
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflowX: 'auto' }}>
                        {loading ? <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div> : filteredTimeline.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Không có dữ liệu cho loại sân này.</div>
                        ) : (
                            <div style={{ minWidth: Math.max(1200, (filteredTimeline[0]?.slots?.length || 0) * 50) }}>

                                <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', height: 48 }}>
                                    <div style={{ width: 120, flexShrink: 0, borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}></div>
                                    
                                    <div style={{ display: 'flex', flex: 1 }}>
                                        {filteredTimeline[0]?.slots.map((slot, i) => {
                                            const isLast = i === filteredTimeline[0].slots.length - 1;
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

                                {filteredTimeline.map(field => (
                                    <div key={field.fieldId} style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
                                        
                                        <div style={{ width: 120, flexShrink: 0, paddingLeft: 16, background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                                            {field.fieldName}
                                        </div>
                                        
                                        <div style={{ display: 'flex', flex: 1 }}>
                                            {field.slots.map((slot, idx) => {
                                                const isSelected = selectedFieldId === field.fieldId && selectedSlots.some(s => s.startTime === slot.startTime);
                                                
                                                let bgColor = '#ffffff'; 
                                                if (slot.isAvailable === false) bgColor = '#cbd5e1'; 
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
                </Card>
            )}
        </div>
    );
};

export default OfflineBooking;
