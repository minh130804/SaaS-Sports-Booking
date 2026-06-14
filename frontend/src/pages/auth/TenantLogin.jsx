import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, IdcardOutlined, MailOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const { Title, Text } = Typography;

const TenantLogin = () => {
    const { domain } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [mode, setMode] = useState(searchParams.get('mode') || 'login');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMode(searchParams.get('mode') || 'login');
    }, [searchParams]);

    const handleSwitchMode = (newMode) => {
        if (newMode === 'login') {
            setSearchParams({});
        } else {
            setSearchParams({ mode: newMode });
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = { ...values, domain };

            if (mode === 'login') {
                const response = await axiosClient.post('/auth/tenant/login', payload);
                const responseData = response.data?.data || response.data;

                const tokenToSave = responseData?.accessToken || responseData?.token;
                const userToSave = responseData?.user;

                if (!tokenToSave || !userToSave) {
                    message.error('Lỗi hệ thống: Không nhận được Token hợp lệ từ máy chủ!');
                    setLoading(false);
                    return; 
                }

                localStorage.setItem('accessToken', tokenToSave);
                localStorage.setItem('userInfo', JSON.stringify(userToSave));
                
                message.success('Đăng nhập thành công!');

                if (userToSave.role === 'OWNER' || userToSave.role === 'STAFF') {
                    navigate(`/${domain}/owner/dashboard`); 
                } else {
                    navigate(`/${domain}`); 
                }

            } else if (mode === 'register') {
                await axiosClient.post('/auth/tenant/register', payload);
                message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
                setSearchParams({});
            } else if (mode === 'forgot-password') {
                const res = await axiosClient.post('/auth/tenant/forgot-password', { email: values.email, domain });
                message.success(res.data.message || 'Mật khẩu mới đã được gửi đến email của bạn!');
                setSearchParams({});
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: 20
        }}>
            <Card 
                style={{ 
                    width: '100%', 
                    maxWidth: 420, 
                    borderRadius: 20, 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    border: 'none',
                    padding: '20px 10px'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <Title level={3} style={{ color: '#10b981', margin: 0, textTransform: 'uppercase' }}>
                        SÂN THỂ THAO {domain}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        {mode === 'login' ? 'Đăng Nhập Hệ Thống' : mode === 'register' ? 'Đăng Ký Tài Khoản' : 'Quên Mật Khẩu'}
                    </Text>
                </div>

                <Form name="auth_form" onFinish={onFinish} layout="vertical" size="large">

                    {mode === 'register' && (
                        <>
                            <Form.Item name="full_name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                                <Input prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />} placeholder="Họ và tên" />
                            </Form.Item>
                            
                            <Form.Item name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                                <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} placeholder="Số điện thoại" />
                            </Form.Item>
                        </>
                    )}

                    {(mode === 'register' || mode === 'forgot-password') && (
                        <Form.Item name="email" rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}>
                            <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="Địa chỉ Email" />
                        </Form.Item>
                    )}

                    {mode !== 'forgot-password' && (
                        <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
                            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Tên đăng nhập" />
                        </Form.Item>
                    )}

                    {mode !== 'forgot-password' && (
                        <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                            <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Mật khẩu" />
                        </Form.Item>
                    )}

                    {mode === 'login' && (
                        <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -10 }}>
                            <Button type="link" onClick={() => handleSwitchMode('forgot-password')} style={{ padding: 0, color: '#64748b' }}>
                                Quên mật khẩu?
                            </Button>
                        </div>
                    )}

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block 
                            loading={loading}
                            style={{ 
                                background: '#10b981', 
                                borderColor: '#10b981', 
                                fontWeight: 'bold', 
                                height: 45, 
                                borderRadius: 8,
                                fontSize: 16
                            }}
                        >
                            {mode === 'login' ? 'Đăng Nhập' : mode === 'register' ? 'Đăng Ký Ngay' : 'Gửi Mật Khẩu Mới'}
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Text type="secondary">
                            {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                        </Text>
                        <Button type="link" onClick={() => handleSwitchMode(mode === 'login' ? 'register' : 'login')} style={{ padding: 0, fontWeight: 'bold', color: '#10b981' }}>
                            {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default TenantLogin;