import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Space, Descriptions, Typography, Divider } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';

const { Text } = Typography;

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [customerDetail, setCustomerDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/customers');
            setCustomers(res.data.data);
        } catch (error) {
            message.error('Lỗi khi tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const showDetailModal = async (id) => {
        setIsDetailModalVisible(true);
        setDetailLoading(true);
        try {
            const res = await axiosClient.get(`/customers/${id}`);
            setCustomerDetail(res.data.data);
        } catch (error) {
            message.error('Lỗi khi lấy thông tin chi tiết khách hàng!');
            setIsDetailModalVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const columns = [
        {
            title: 'Tên Khách Hàng',
            dataIndex: 'full_name',
            key: 'full_name',
            sorter: (a, b) => a.full_name.localeCompare(b.full_name),
        },
        {
            title: 'Số Điện Thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => email || 'Chưa có'
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EyeOutlined />} onClick={() => showDetailModal(record.id)}>
                        Xem chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Danh sách Khách Hàng</h2>
            </div>

            <Table 
                columns={columns} 
                dataSource={customers} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Thông tin chi tiết Khách hàng"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
            >
                {detailLoading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : customerDetail ? (
                    <div>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Họ và Tên">
                                <Text strong>{customerDetail.full_name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số Điện Thoại">{customerDetail.phone}</Descriptions.Item>
                            <Descriptions.Item label="Email">{customerDetail.email || 'Chưa cập nhật'}</Descriptions.Item>
                            <Descriptions.Item label="Ngày tham gia">{new Date(customerDetail.createdAt).toLocaleDateString('vi-VN')}</Descriptions.Item>
                        </Descriptions>
                        
                        <Divider />
                        
                        <Descriptions column={1} bordered size="small" style={{ marginTop: 20 }}>
                            <Descriptions.Item label="Tổng số lần đặt sân">
                                <Text type="success" strong>{customerDetail.total_bookings} lần</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng chi tiêu">
                                <Text type="danger" strong>{formatCurrency(customerDetail.total_spending)}</Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                ) : (
                    <p>Không tìm thấy thông tin</p>
                )}
            </Modal>
        </div>
    );
};

export default Customers;
