import React, { useState, useEffect } from 'react';
import { Table, Typography, Tag, Space, message, Card } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';

const { Title, Text } = Typography;

const SubscriptionPaymentList = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/subscriptions/admin-payments');
            setData(res.data.data || []);
        } catch (error) {
            message.error('Lỗi lấy danh sách thanh toán: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const columns = [
        {
            title: 'Mã GD (VNPay)',
            dataIndex: 'vnpay_txn_ref',
            key: 'vnpay_txn_ref',
            render: text => <Text copyable>{text || 'N/A'}</Text>
        },
        {
            title: 'Hệ thống (Domain)',
            key: 'tenant',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <strong>{record.Tenant?.name}</strong>
                    <Text type="secondary">{record.Tenant?.custom_domain}</Text>
                </Space>
            )
        },
        {
            title: 'Gói cước',
            key: 'plan',
            render: (_, record) => <Tag color="blue">{record.Plan?.name}</Tag>
        },
        {
            title: 'Chu kỳ',
            dataIndex: 'billing_cycle',
            key: 'billing_cycle',
            render: text => text === 'YEARLY' ? <Tag color="purple">Theo Năm</Tag> : <Tag color="cyan">Theo Tháng</Tag>
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: val => <strong style={{ color: '#10b981' }}>{Number(val).toLocaleString('vi-VN')}đ</strong>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: status => {
                let color = 'default';
                let label = status;
                if (status === 'SUCCESS') { color = 'success'; label = 'Thành công'; }
                else if (status === 'FAILED') { color = 'error'; label = 'Thất bại'; }
                else if (status === 'PENDING') { color = 'warning'; label = 'Chờ xử lý'; }
                return <Tag color={color}>{label}</Tag>;
            }
        },
        {
            title: 'Ngày giao dịch',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: date => new Date(date).toLocaleString('vi-VN')
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={2} style={{ margin: 0 }}>
                    <DollarOutlined style={{ marginRight: 10, color: '#10b981' }} />
                    Lịch sử Giao dịch Gói cước
                </Title>
            </div>

            <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: 0 }}>
                <Table 
                    columns={columns} 
                    dataSource={data} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default SubscriptionPaymentList;
