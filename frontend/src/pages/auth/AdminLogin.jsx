import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const AdminLogin = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {

            const response = await axiosClient.post('/auth/admin/login', {
                username: values.username,
                password: values.password
            });

            const { token, user } = response.data;

            localStorage.setItem('accessToken', token);
            localStorage.setItem('userInfo', JSON.stringify(user));
            
            message.success('Đăng nhập Quản trị viên thành công!');
            navigate('/admin/dashboard');

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Lỗi kết nối máy chủ!';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1f1c2c 0%, #928DAB 100%)' }}>
            <div style={{ width: 400, padding: 40, background: 'rgba(255, 255, 255, 0.95)', borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: 24, fontWeight: 'bold', color: '#333' }}>
                    SaaS SUPER ADMIN
                </h2>
                <Form name="admin_login" onFinish={onFinish} size="large">
                    <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Tài khoản Admin" />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 32 }}>
                        <Button type="primary" htmlType="submit" loading={loading} block style={{ background: '#333', borderColor: '#333' }}>
                            Truy cập Hệ thống
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default AdminLogin;