import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Typography, Divider, TimePicker, Row, Col, Upload } from 'antd';
import { SettingOutlined, PhoneOutlined, EnvironmentOutlined, ShopOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../../api/axiosClient';

const { Title } = Typography;

const Settings = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axiosClient.get('/tenants/settings');
            const data = res.data.data;
            
            setLogoUrl(data.logo_url || '');
            form.setFieldsValue({
                name: data.name,
                address: data.address,
                phone: data.phone,
                logo_url: data.logo_url,
                open_time: data.open_time ? dayjs(data.open_time, 'HH:mm') : dayjs('06:00', 'HH:mm'),
                close_time: data.close_time ? dayjs(data.close_time, 'HH:mm') : dayjs('22:00', 'HH:mm'),
            });
        } catch (error) {
            message.error("Lỗi khi tải thông tin cài đặt!");
        } finally {
            setFetching(false);
        }
    };

    const handleUpload = async (options) => {
        const { onSuccess, onError, file } = options;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axiosClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onSuccess("Ok");
            setLogoUrl(res.data.url);
            form.setFieldsValue({ logo_url: res.data.url });
            message.success('Tải ảnh lên thành công');
        } catch (error) {
            onError(error);
            message.error('Lỗi khi tải ảnh lên');
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                name: values.name,
                address: values.address,
                phone: values.phone,
                logo_url: values.logo_url,
                open_time: values.open_time ? values.open_time.format('HH:mm') : null,
                close_time: values.close_time ? values.close_time.format('HH:mm') : null,
            };
            
            await axiosClient.put('/tenants/settings', payload);
            message.success('Cập nhật thông tin hệ thống thành công!');
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '20px auto' }}>
            <Card loading={fetching} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                    <SettingOutlined style={{ fontSize: 28, color: '#10b981', marginRight: 12 }} />
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Cài Đặt Hệ Thống</Title>
                        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Cấu hình thông tin hiển thị của sân bóng tới khách hàng</p>
                    </div>
                </div>

                <Divider />

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item 
                                label="Tên sân bóng (Hiển thị tới khách hàng)" 
                                name="name" 
                                rules={[{ required: true, message: 'Vui lòng nhập tên sân bóng!' }]}
                            >
                                <Input prefix={<ShopOutlined />} size="large" placeholder="VD: Sân bóng cỏ nhân tạo Đại Nam" />
                            </Form.Item>
                        </Col>
                        
                        <Col span={12}>
                            <Form.Item 
                                label="Số điện thoại Hotline" 
                                name="phone"
                            >
                                <Input prefix={<PhoneOutlined />} size="large" placeholder="VD: 0912345678" />
                            </Form.Item>
                        </Col>
                        
                        <Col span={12}>
                            <Form.Item label="Ảnh Logo" name="logo_url" style={{ marginBottom: 0 }}>
                                <Input type="hidden" />
                            </Form.Item>
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ marginBottom: 8, color: 'rgba(0, 0, 0, 0.88)' }}>Ảnh Logo</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <Upload
                                        customRequest={handleUpload}
                                        showUploadList={false}
                                        accept="image/*"
                                    >
                                        <Button icon={<UploadOutlined />} size="large">Chọn file từ máy</Button>
                                    </Upload>
                                    {logoUrl && (
                                        <div style={{ border: '1px solid #d9d9d9', padding: 4, borderRadius: 8 }}>
                                            <img src={logoUrl} alt="Logo" style={{ height: 40, width: 40, objectFit: 'cover', display: 'block', borderRadius: 4 }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>

                        <Col span={24}>
                            <Form.Item 
                                label="Địa chỉ Trụ sở chính" 
                                name="address"
                                tooltip="Địa chỉ này sẽ hiển thị ở phần Liên hệ dưới cùng trang chủ Khách hàng."
                            >
                                <Input.TextArea prefix={<EnvironmentOutlined />} rows={2} size="large" placeholder="VD: 123 Đường ABC, Phường X, Quận Y, TP.Z" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item 
                                label="Giờ mở cửa" 
                                name="open_time"
                                rules={[{ required: true, message: 'Vui lòng chọn giờ mở cửa!' }]}
                            >
                                <TimePicker format="HH:mm" size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item 
                                label="Giờ đóng cửa" 
                                name="close_time"
                                rules={[{ required: true, message: 'Vui lòng chọn giờ đóng cửa!' }]}
                            >
                                <TimePicker format="HH:mm" size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Button type="primary" htmlType="submit" size="large" loading={loading} style={{ padding: '0 40px', height: 48, borderRadius: 8, fontSize: 16 }}>
                            Lưu Cài Đặt
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Settings;
