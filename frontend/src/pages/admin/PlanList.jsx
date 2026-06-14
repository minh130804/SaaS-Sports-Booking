import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';

const PlanList = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/plans');
            setPlans(response.data.data);
        } catch (error) {
            message.error('Lỗi khi tải danh sách gói cước');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const showAddModal = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (record) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/plans/${id}`);
            message.success('Xóa gói cước thành công');
            fetchPlans();
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi xóa gói cước');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingId) {
                await axiosClient.put(`/plans/${editingId}`, values);
                message.success('Cập nhật gói cước thành công');
            } else {
                await axiosClient.post('/plans', values);
                message.success('Thêm mới gói cước thành công');
            }
            setIsModalVisible(false);
            fetchPlans();
        } catch (error) {
            if (error.response) {
                message.error(error.response.data.message || 'Lỗi thao tác');
            }
        }
    };

    const columns = [
        { 
            title: 'Tên Gói Cước', 
            dataIndex: 'name', 
            key: 'name', 
            render: (text, record) => (
                <Space>
                    <b>{text}</b>
                    {record.id === 1 && <Tag color="blue">Mặc định</Tag>}
                </Space>
            )
        },
        { 
            title: 'Giới hạn sân', 
            dataIndex: 'max_fields', 
            key: 'max_fields',
            render: (val) => val >= 999 ? <Tag color="purple">Vô hạn</Tag> : <Tag color="green">{val} sân</Tag>
        },
        { 
            title: 'Giới hạn nhân viên', 
            dataIndex: 'max_staffs', 
            key: 'max_staffs',
            render: (val) => val >= 999 ? <Tag color="purple">Vô hạn</Tag> : <Tag color="orange">{val} tài khoản</Tag>
        },
        { 
            title: 'Giá / Tháng', 
            dataIndex: 'monthly_price', 
            key: 'monthly_price',
            render: (price) => <span style={{ color: '#cf1322', fontWeight: 'bold' }}>{Number(price).toLocaleString()}đ</span>
        },
        { 
            title: 'Giá / Năm', 
            dataIndex: 'yearly_price', 
            key: 'yearly_price',
            render: (price) => <span style={{ color: '#389e0d', fontWeight: 'bold' }}>{Number(price).toLocaleString()}đ</span>
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                if (record.id === 1) {
                    return <Tag color="default">Hệ thống (Không được sửa/xóa)</Tag>;
                }
                return (
                    <Space size="middle">
                        <Button type="primary" ghost icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)}>Sửa</Button>
                        <Popconfirm title="Bạn có chắc chắn muốn xóa gói này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                            <Button danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}><GiftOutlined style={{ marginRight: 10, color: '#ff4d4f' }}/>Quản lý Gói cước Đăng ký</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                    Tạo gói cước mới
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={plans} 
                rowKey="id" 
                loading={loading} 
                bordered 
            />

            <Modal 
                title={editingId ? "Cập nhật Thông tin Gói cước" : "Tạo Gói cước Đăng ký Mới"} 
                open={isModalVisible} 
                onOk={handleOk} 
                onCancel={() => setIsModalVisible(false)}
                okText="Lưu lại"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Tên Gói Cước" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên gói!' }]}>
                        <Input placeholder="VD: Gói Cơ Bản, Gói Chuyên Nghiệp" />
                    </Form.Item>

                    <Form.Item label="Giới hạn số sân tối đa" name="max_fields" rules={[{ required: true, message: 'Nhập số lượng sân!' }]}>
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số sân tối đa (ví dụ 3 hoặc 999 để không giới hạn)" />
                    </Form.Item>

                    <Form.Item label="Giới hạn số nhân viên tối đa" name="max_staffs" rules={[{ required: true, message: 'Nhập số lượng nhân viên!' }]}>
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số nhân viên tối đa (ví dụ 5 hoặc 999 để không giới hạn)" />
                    </Form.Item>

                    <Form.Item label="Giá cước theo tháng (VNĐ)" name="monthly_price" rules={[{ required: true, message: 'Nhập giá tháng!' }]}>
                        <InputNumber min={0} step={10000} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="VD: 200,000" />
                    </Form.Item>

                    <Form.Item label="Giá cước theo năm (VNĐ)" name="yearly_price" rules={[{ required: true, message: 'Nhập giá năm!' }]}>
                        <InputNumber min={0} step={50000} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="VD: 2,000,000" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default PlanList;
