import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Spin, message } from 'antd';
import { useParams, Navigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const { Title, Text } = Typography;

const BookingHistory = () => {
    const { domain } = useParams();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

    if (!userInfo) return <Navigate to={`/${domain}/login`} replace />;

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get('/bookings/my-history');
                setBookings(response.data.data);
            } catch (error) {
                message.error('Lỗi khi tải lịch sử đặt sân!');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const columns = [
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            render: (date) => new Date(date).toLocaleString('vi-VN'),
        },
        {
            title: 'Sân thi đấu',
            key: 'field',
            render: (_, record) => <Text strong>{record.Field?.name}</Text>
        },
        {
            title: 'Thời gian thi đấu',
            key: 'playTime',
            render: (_, record) => (
                <div>
                    <div style={{ color: '#10b981', fontWeight: 'bold' }}>{record.booking_date}</div>
                    <Text type="secondary">{record.start_time} - {record.end_time}</Text>
                </div>
            )
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_price',
            render: (price) => <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{Number(price).toLocaleString()}đ</span>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status) => {
                let color = 'default';
                let text = 'Chờ duyệt';
                if (status === 'CONFIRMED') { color = 'success'; text = 'Đã duyệt'; }
                if (status === 'CANCELLED') { color = 'error'; text = 'Đã hủy'; }
                if (status === 'COMPLETED') { color = 'processing'; text = 'Hoàn thành'; }
                return <Tag color={color}>{text.toUpperCase()}</Tag>;
            }
        }
    ];

    return (
        <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto', minHeight: '60vh' }}>
            <Title level={2} style={{ color: '#0f172a', fontWeight: 800, marginBottom: 24 }}>Lịch Sử Đặt Sân</Title>
            
            <div style={{ background: 'white', padding: 24, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table 
                    columns={columns} 
                    dataSource={bookings} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </div>
    );
};

export default BookingHistory;