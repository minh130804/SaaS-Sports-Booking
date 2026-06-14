import React, { useState, useEffect } from 'react';
import { 
    Typography, Table, Tag, Space, Button, message, Popconfirm, Card, 
    Modal, Form, DatePicker, TimePicker, Select, Tooltip, Badge
} from 'antd';
import { 
    CheckOutlined, CloseOutlined, CalendarOutlined, 
    EditOutlined, DeleteOutlined, ExclamationCircleOutlined 
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import axiosClient from '../../api/axiosClient';

const { Title, Text } = Typography;
const { confirm } = Modal;

const STATUS_CONFIG = {
    PENDING:   { color: 'warning',    text: 'Chờ duyệt',  badge: 'default'   },
    CONFIRMED: { color: 'success',    text: 'Đã duyệt',   badge: 'success'   },
    CANCELLED: { color: 'error',      text: 'Đã hủy',     badge: 'error'     },
    COMPLETED: { color: 'processing', text: 'Hoàn thành', badge: 'processing'},
};

const PAYMENT_STATUS_CONFIG = {
    UNPAID:   { color: 'orange', text: 'Chưa TT' },
    PAID:     { color: 'green',  text: 'Đã TT'   },
    REFUNDED: { color: 'blue',   text: 'Hoàn TT' },
};

const BookingManagement = () => {
    const { domain } = useParams();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isOwner = userInfo.role === 'OWNER';
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editForm] = Form.useForm();

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/bookings/tenant');
            setBookings(response.data.data);
        } catch (error) {
            message.error('Lỗi khi tải danh sách lịch đặt!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdateStatus = async (bookingId, newStatus) => {
        try {
            await axiosClient.put(`/bookings/${bookingId}/status`, { status: newStatus });
            message.success(`Đã ${newStatus === 'CONFIRMED' ? 'duyệt' : 'hủy'} lịch đặt thành công!`);
            fetchBookings();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!');
        }
    };

    const openEditModal = (booking) => {
        setEditingBooking(booking);
        editForm.setFieldsValue({
            booking_date: dayjs(booking.booking_date),
            start_time: dayjs(`2000-01-01 ${booking.start_time}`),
            end_time: dayjs(`2000-01-01 ${booking.end_time}`),
            status: booking.status,
            payment_status: booking.payment_status,
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validateFields();
            setEditLoading(true);
            await axiosClient.put(`/bookings/${editingBooking.id}`, {
                booking_date: values.booking_date.format('YYYY-MM-DD'),
                start_time: values.start_time.format('HH:mm'),
                end_time: values.end_time.format('HH:mm'),
                status: values.status,
                payment_status: values.payment_status,
            });
            message.success('Cập nhật lịch đặt thành công!');
            setEditModalOpen(false);
            fetchBookings();
        } catch (error) {
            if (error?.response) {
                message.error(error.response?.data?.message || 'Lỗi khi cập nhật!');
            }
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = (bookingId, customerName) => {
        confirm({
            title: 'Xác nhận xóa lịch đặt',
            icon: <ExclamationCircleOutlined style={{ color: '#ef4444' }} />,
            content: (
                <div>
                    <p>Bạn chắc chắn muốn <b style={{ color: '#ef4444' }}>XÓA VĨNH VIỄN</b> lịch đặt của khách hàng <b>{customerName}</b>?</p>
                    <p style={{ color: '#64748b', fontSize: 13 }}>Thao tác này không thể hoàn tác. Chỉ dùng khi có sự cố đặc biệt.</p>
                </div>
            ),
            okText: 'Xóa',
            okButtonProps: { danger: true },
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axiosClient.delete(`/bookings/${bookingId}`);
                    message.success('Đã xóa lịch đặt');
                    fetchBookings();
                } catch (error) {
                    message.error(error.response?.data?.message || 'Lỗi khi xóa!');
                }
            }
        });
    };

    const columns = [
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 150,
            render: (date) => new Date(date).toLocaleString('vi-VN'),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: 160,
            render: (_, record) => (
                <div>
                    <Text strong>{record.customer?.full_name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.customer?.phone || 'Chưa cập nhật'}</Text>
                </div>
            )
        },
        {
            title: 'Loại sân',
            key: 'field',
            width: 150,
            render: (_, record) => (
                <div>
                    <Tag color="geekblue" style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                        {record.Field?.name || 'Sân đã xóa'}
                    </Tag>
                    <br />
                    {record.Field?.type && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Sân {record.Field.type} người
                        </Text>
                    )}
                </div>
            )
        },
        {
            title: 'Thời gian',
            key: 'playTime',
            width: 160,
            render: (_, record) => (
                <div>
                    <div style={{ color: '#10b981', fontWeight: 'bold' }}>{record.booking_date}</div>
                    <Text type="secondary" style={{ fontSize: 13 }}>{record.start_time?.substring(0,5)} → {record.end_time?.substring(0,5)}</Text>
                </div>
            )
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_price',
            width: 120,
            render: (price) => <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{Number(price).toLocaleString()}đ</span>
        },
        {
            title: 'Thanh toán',
            key: 'payment',
            width: 140,
            render: (_, record) => {
                const method = record.payment_method || 'CASH';
                const ps = PAYMENT_STATUS_CONFIG[record.payment_status] || PAYMENT_STATUS_CONFIG.UNPAID;
                return (
                    <div>
                        <Tag color={method === 'VNPAY' ? 'blue' : 'default'} style={{ fontSize: 11 }}>
                            {method === 'VNPAY' ? '💳 VNPay' : '💵 Tiền mặt'}
                        </Tag>
                        <br />
                        <Tag color={ps.color} style={{ marginTop: 4, fontSize: 11 }}>{ps.text}</Tag>
                    </div>
                );
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 120,
            render: (status) => {
                const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
                return <Tag color={cfg.color} style={{ fontWeight: 'bold' }}>{cfg.text}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 220,
            render: (_, record) => {
                if (!isOwner) return <Tag color="orange">Chỉ xem</Tag>;
                return (
                <Space size={6} wrap>

                    {record.status === 'PENDING' && (
                        <Popconfirm
                            title="Xác nhận duyệt lịch đặt này?"
                            onConfirm={() => handleUpdateStatus(record.id, 'CONFIRMED')}
                            okText="Duyệt" cancelText="Hủy"
                        >
                            <Button 
                                type="primary" 
                                style={{ background: '#10b981', borderColor: '#10b981' }} 
                                icon={<CheckOutlined />} size="small"
                            >
                                Duyệt
                            </Button>
                        </Popconfirm>
                    )}

                    <Tooltip title="Sửa thông tin lịch đặt">
                        <Button 
                            icon={<EditOutlined />} 
                            size="small" 
                            onClick={() => openEditModal(record)}
                        >
                            Sửa
                        </Button>
                    </Tooltip>

                    <Tooltip title="Xóa vĩnh viễn lịch này">
                        <Button 
                            danger
                            icon={<DeleteOutlined />} 
                            size="small"
                            onClick={() => handleDelete(record.id, record.customer?.full_name)}
                        >
                            Xóa
                        </Button>
                    </Tooltip>
                </Space>
                );
            }
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
                <CalendarOutlined style={{ fontSize: 28, color: '#10b981' }} />
                <Title level={3} style={{ margin: 0, color: '#0f172a' }}>Quản lý Lịch Đặt Sân</Title>
                <Badge count={bookings.filter(b => b.status === 'PENDING').length} style={{ marginLeft: 4 }} />
            </div>

            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table 
                    columns={columns} 
                    dataSource={bookings} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                    rowClassName={(record) => record.status === 'PENDING' ? 'pending-row' : ''}
                />
            </Card>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <EditOutlined style={{ color: '#10b981' }} />
                        <span>Sửa Lịch Đặt #{editingBooking?.id}</span>
                    </div>
                }
                open={editModalOpen}
                onOk={handleEditSubmit}
                onCancel={() => setEditModalOpen(false)}
                okText="Lưu thay đổi"
                cancelText="Hủy"
                confirmLoading={editLoading}
                okButtonProps={{ style: { background: '#10b981', borderColor: '#10b981' } }}
                width={500}
            >
                {editingBooking && (
                    <div style={{ marginBottom: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 13, color: '#64748b' }}>
                        Khách: <b>{editingBooking.customer?.full_name}</b> | SĐT: {editingBooking.customer?.phone || 'N/A'}
                    </div>
                )}
                <Form form={editForm} layout="vertical">
                    <Form.Item label="Ngày thi đấu" name="booking_date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item label="Giờ bắt đầu" name="start_time" rules={[{ required: true }]}>
                        <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={30} />
                    </Form.Item>
                    <Form.Item label="Giờ kết thúc" name="end_time" rules={[{ required: true }]}>
                        <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={30} />
                    </Form.Item>
                    <Form.Item label="Trạng thái lịch" name="status">
                        <Select>
                            <Select.Option value="PENDING">⏳ Chờ duyệt</Select.Option>
                            <Select.Option value="CONFIRMED">✅ Đã duyệt</Select.Option>
                            <Select.Option value="CANCELLED">❌ Đã hủy</Select.Option>
                            <Select.Option value="COMPLETED">🏁 Hoàn thành</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Trạng thái thanh toán" name="payment_status">
                        <Select>
                            <Select.Option value="UNPAID">💰 Chưa thanh toán</Select.Option>
                            <Select.Option value="PAID">✅ Đã thanh toán</Select.Option>
                            <Select.Option value="REFUNDED">🔄 Đã hoàn tiền</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BookingManagement;