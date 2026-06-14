import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Typography, Divider } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';

const { Title } = Typography;

const Profile = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axiosClient.get('/profile/me');
            setUser(res.data.data);
            form.setFieldsValue({
                full_name: res.data.data.full_name,
                phone: res.data.data.phone,
                email: res.data.data.email,
                username: res.data.data.username
            });
        } catch (error) {
            message.error("Lỗi khi tải thông tin cá nhân!");
        } finally {
            setFetching(false);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = { ...values };
            if (!payload.password) {
                delete payload.password;
            }
            await axiosClient.put('/profile/me', payload);
            message.success('Cập nhật thông tin thành công!');
            form.setFieldsValue({ old_password: '', password: '' });
            
            // Cập nhật lại userInfo trong localStorage nếu đổi tên
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo) {
                userInfo.full_name = values.full_name;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                window.dispatchEvent(new Event('storage')); // Trigger update for layout
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
            <Card loading={fetching} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ 
                        width: 80, height: 80, borderRadius: '50%', background: '#10b981', 
                        color: '#fff', fontSize: 32, display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', margin: '0 auto 16px' 
                    }}>
                        {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <Title level={3} style={{ margin: 0 }}>Thông Tin Cá Nhân</Title>
                    <p style={{ color: '#64748b', marginTop: 8 }}>Quản lý thông tin và tài khoản của bạn</p>
                </div>

                <Divider />

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item 
                        label="Tên đăng nhập" 
                        name="username"
                    >
                        <Input disabled prefix={<UserOutlined />} size="large" />
                    </Form.Item>

                    <Form.Item 
                        label="Họ và Tên" 
                        name="full_name" 
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                        <Input prefix={<UserOutlined />} size="large" />
                    </Form.Item>

                    <Form.Item 
                        label="Số điện thoại" 
                        name="phone" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                        ]}
                    >
                        <Input prefix={<PhoneOutlined />} size="large" />
                    </Form.Item>

                    <Form.Item 
                        label="Email" 
                        name="email" 
                        rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
                    >
                        <Input prefix={<MailOutlined />} size="large" placeholder="Nhập email của bạn (không bắt buộc)" />
                    </Form.Item>

                    <Divider dashed>Đổi mật khẩu (Tuỳ chọn)</Divider>

                    <Form.Item 
                        label="Mật khẩu hiện tại" 
                        name="old_password"
                        tooltip="Bắt buộc nếu bạn muốn đổi mật khẩu mới"
                    >
                        <Input.Password prefix={<LockOutlined />} size="large" placeholder="Nhập mật khẩu hiện tại..." />
                    </Form.Item>

                    <Form.Item 
                        label="Mật khẩu mới" 
                        name="password"
                        dependencies={['old_password']}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (value && !getFieldValue('old_password')) {
                                        return Promise.reject(new Error('Vui lòng nhập mật khẩu hiện tại trước!'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} size="large" placeholder="Nhập mật khẩu mới..." />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" size="large" loading={loading} block style={{ height: 48, borderRadius: 8, fontSize: 16 }}>
                            Lưu Thay Đổi
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Profile;
