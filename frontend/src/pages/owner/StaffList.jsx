import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';

const StaffList = () => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isOwner = userInfo.role === 'OWNER';

    const fetchStaffs = async () => {
        setLoading(true);
        try {

            const response = await axiosClient.get('/staffs');
            setStaffs(response.data.data);
        } catch (error) {
            message.error('Lỗi tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStaffs(); }, []);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await axiosClient.post('/staffs', values);
            message.success('Tạo tài khoản nhân viên thành công');
            setIsModalVisible(false);
            fetchStaffs();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/staffs/${id}`);
            message.success('Đã xóa nhân viên');
            fetchStaffs();
        } catch (error) {
            message.error('Lỗi khi xóa');
        }
    };

    const columns = [
        { title: 'Họ và tên', dataIndex: 'full_name', key: 'full_name', fontWeight: 'bold' },
        { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'Vai trò', dataIndex: 'role', key: 'role', render: () => <Tag color="blue">NHÂN VIÊN</Tag> },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                if (!isOwner) return <Tag color="orange">Chỉ xem</Tag>;
                return (
                    <Popconfirm title="Xóa nhân viên này?" onConfirm={() => handleDelete(record.id)}>
                        <Button danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                    </Popconfirm>
                );
            },
        },
    ];

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}><TeamOutlined style={{ marginRight: 10, color: '#1890ff' }}/>Quản lý Nhân Viên</h2>
                {isOwner && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setIsModalVisible(true); }}>
                        Thêm nhân viên
                    </Button>
                )}
            </div>
            <Table columns={columns} dataSource={staffs} rowKey="id" loading={loading} bordered />

            <Modal title="Cấp tài khoản Nhân viên" open={isModalVisible} onOk={handleOk} onCancel={() => setIsModalVisible(false)} okText="Tạo tài khoản" cancelText="Hủy">
                <Form form={form} layout="vertical">
                    <Form.Item label="Họ và tên" name="full_name" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Tên đăng nhập" name="username" rules={[{ required: true, message: 'Nhập tên đăng nhập!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mật khẩu khởi tạo" name="password" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default StaffList;