import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import '../assets/styles/login.scss';

const Login = () => {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {

            const response = await axiosClient.post('/auth/login', {
                username: values.username,
                password: values.password
            });

            const { token, user } = response.data;
            
            localStorage.setItem('accessToken', token);
            localStorage.setItem('userInfo', JSON.stringify(user));
            
            message.success('Đăng nhập thành công!');

            if (user.role === 'SUPER_ADMIN') {
                window.location.href = '/admin/dashboard';
            } else if (user.role === 'OWNER') {

                window.location.href = `/${user.domain}/dashboard`;
            } else {
                window.location.href = `/${user.domain}`; 
            }

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Lỗi kết nối máy chủ!';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="logo-text">SaaS Sports Booking</div>
                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Tài khoản" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} className="login-btn">
                            Đăng Nhập
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Login;