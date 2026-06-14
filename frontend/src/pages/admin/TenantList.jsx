import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message } from 'antd'; // Đã xóa import Card
import { PlusOutlined, DeleteOutlined, ShopOutlined, SyncOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const TenantList = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/tenants');
            setTenants(response.data.data);
        } catch (error) {
            message.error('Lỗi khi tải danh sách Hệ thống sân');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/tenants/${id}`);
            message.success('Đã xóa hệ thống sân');
            fetchTenants();
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi xóa');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { 
            title: 'Tên miền', 
            dataIndex: 'custom_domain', 
            key: 'custom_domain',
            render: (domain) => <a href={`/${domain}`} target="_blank" rel="noreferrer" style={{ fontWeight: 'bold' }}>{domain}</a>
        },
        { 
            title: 'Chủ sân', 
            key: 'owner_name',
            render: (_, record) => <b style={{ color: '#1890ff' }}>{record.ownerInfo?.full_name || 'N/A'}</b>
        },
        { 
            title: 'Tài khoản', 
            key: 'owner_username',
            render: (_, record) => record.ownerInfo?.username || 'N/A'
        },
        { 
            title: 'Số điện thoại', 
            key: 'owner_phone',
            render: (_, record) => record.ownerInfo?.phone || 'N/A'
        },
        { 
            title: 'Email', 
            key: 'owner_email',
            render: (_, record) => record.ownerInfo?.email || 'N/A'
        },
        { 
            title: 'Trạng thái', 
            key: 'status', 
            render: () => <Tag color="success">ĐANG HOẠT ĐỘNG</Tag> 
        },
        { 
            title: 'Ngày tạo', 
            dataIndex: 'createdAt', 
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                const isActive = record.subscription_end_date && new Date(record.subscription_end_date) > new Date();
                return (
                    <Space size="middle">
                        {isActive ? (
                            <Button danger disabled size="small" title="Không thể xoá vì chủ sân vẫn còn hạn sử dụng gói cước"> Xóa</Button>
                        ) : (
                            <Popconfirm title="Xóa toàn bộ hệ thống sân này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                                <Button danger icon={<DeleteOutlined />} size="small"> Xóa</Button>
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, color: '#333' }}>
                    <ShopOutlined style={{ marginRight: 10, color: '#1890ff' }}/>
                    Danh Sách Hệ Thống Sân (Tenants)
                </h2>
                <Space>
                    <Button icon={<SyncOutlined />} onClick={fetchTenants}>Làm mới</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/tenants/create')}>
                        Thêm Chủ sân mới
                    </Button>
                </Space>
            </div>

            <Table 
                columns={columns} 
                dataSource={tenants} 
                rowKey="id" 
                loading={loading} 
                bordered 
                style={{ flex: 1, backgroundColor: '#fff' }} 
                pagination={{ pageSize: 10, showSizeChanger: false }}
            />
        </div>
    );
};

export default TenantList;