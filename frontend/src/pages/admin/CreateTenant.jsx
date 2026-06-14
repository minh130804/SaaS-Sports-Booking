import React, { useState } from 'react';
import { Form, Input, Button, Card, Row, Col, Select, message, Typography } from 'antd';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const CreateTenant = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {

            await axiosClient.post('/tenants/create', values);
            
            message.success('Tạo chủ sân và tài khoản quản trị thành công!');
            form.resetFields(); // Xóa trắng form

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi tạo chủ sân!';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Title level={3} style={{ marginTop: 0, marginBottom: 24 }}>Đăng Ký Hệ Thống Chủ Sân Mới</Title>
            
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={24}>

                    <Col span={12}>
                        <Card title="1. Thông tin Hệ thống (Tenant)" size="small" bordered={false} style={{ background: '#f5f5f5' }}>
                            <Form.Item label="Tên thương hiệu / Tên sân" name="tenantName" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                                <Input placeholder="VD: Hệ thống Sân Bóng Chảo Lửa" />
                            </Form.Item>

                            <Form.Item label="Tên miền riêng (Domain)" name="custom_domain" rules={[{ required: true, message: 'Vui lòng nhập tên miền!' }]}>
                                <Input placeholder="VD: chaolua.com hoặc san1.hethong.com" />
                            </Form.Item>

                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card title="2. Tài khoản Quản trị (Owner)" size="small" bordered={false} style={{ background: '#f5f5f5' }}>
                            <Form.Item label="Họ và tên chủ sân" name="full_name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                                <Input placeholder="Nguyễn Văn A" />
                            </Form.Item>

                            <Form.Item label="Số điện thoại" name="phone">
                                <Input placeholder="0987654321" />
                            </Form.Item>

                            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
                                <Input placeholder="owner@gmail.com" />
                            </Form.Item>

                            <Form.Item label="Tên đăng nhập (Username)" name="username" rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}>
                                <Input placeholder="owner_chaolua" />
                            </Form.Item>

                            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!', min: 6 }]}>
                                <Input.Password placeholder="******" />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit" size="large" loading={loading}>
                        Khởi tạo Hệ Thống
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CreateTenant;