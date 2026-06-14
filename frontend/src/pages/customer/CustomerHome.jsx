import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Tag, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom'; 
import { ThunderboltOutlined, CheckCircleOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';

const { Title, Text } = Typography;

const CustomerHome = () => {
    const { domain } = useParams();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState(null);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const res = await axiosClient.get(`/public/fields/${domain}`);
                setTenant(res.data.tenant);
            } catch (error) {}
        };
        fetchTenant();
    }, [domain]);
    
    return (
        <div style={{ background: '#f8fafc' }}>

            <div style={{ 
                position: 'relative', height: 600, 
                background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px'
            }}>
                <Tag color="#10b981" style={{ padding: '6px 16px', borderRadius: 20, fontSize: 14, fontWeight: 'bold', marginBottom: 20, border: 'none' }}>
                    🏆 HỆ THỐNG SÂN CAO CẤP
                </Tag>
                <Title style={{ color: 'white', fontSize: 48, fontWeight: 900, marginBottom: 16 }}>
                    Nâng Tầm Trải Nghiệm Thể Thao
                </Title>
                <Text style={{ color: '#cbd5e1', fontSize: 18, maxWidth: 600, marginBottom: 40 }}>
                    Lựa chọn sân bãi đạt chuẩn, xem lịch trống trực quan và đặt lịch tự động hóa 24/7. 
                </Text>
                
                <Button 
                    type="primary" size="large" 
                    icon={<ThunderboltOutlined />} 
                    onClick={() => navigate(`/${domain}/fields`)}
                    style={{ height: 60, padding: '0 40px', fontSize: 18, borderRadius: 30, background: '#10b981', borderColor: '#10b981', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)' }}
                >
                    XEM DANH SÁCH SÂN NGAY
                </Button>
            </div>

            <div style={{ background: 'white', padding: '80px 20px', textAlign: 'center' }}>
                <Title level={2} style={{ color: '#0f172a', fontWeight: 800, marginBottom: 40 }}>Tại Sao Chọn Chúng Tôi?</Title>
                <Row gutter={[32, 32]} style={{ maxWidth: 1000, margin: '0 auto' }}>
                    {['Mặt sân đạt chuẩn thi đấu', 'Hệ thống đèn LED chống lóa', 'Quy trình đặt sân 100% Online'].map((text, i) => (
                        <Col xs={24} md={8} key={i}>
                            <div style={{ padding: 30, background: '#f8fafc', borderRadius: 20, border: '1px solid #e2e8f0' }}>
                                <CheckCircleOutlined style={{ fontSize: 40, color: '#10b981', marginBottom: 20 }} />
                                <Title level={5} style={{ color: '#334155' }}>{text}</Title>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            <div id="contact-section" style={{ background: '#f8fafc', padding: '80px 20px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                    <Title level={2} style={{ color: '#0f172a', fontWeight: 800, marginBottom: 16 }}>Hỗ Trợ & Liên Hệ</Title>
                    <Text style={{ fontSize: 16, color: '#64748b', display: 'block', marginBottom: 40 }}>Bạn cần hỗ trợ đặt lịch cố định hoặc giải đáp thắc mắc? Hãy liên hệ với chúng tôi!</Text>
                    
                    <Row gutter={[24, 24]} justify="center">
                        <Col xs={24} md={8}>
                            <div style={{ padding: '30px 20px', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                                <PhoneOutlined style={{ fontSize: 32, color: '#10b981', marginBottom: 16 }} />
                                <Title level={4}>Hotline / Zalo</Title>
                                <Text strong style={{ fontSize: 18, color: '#0f172a' }}>{tenant?.phone || '0123.456.789'}</Text>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div style={{ padding: '30px 20px', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                                <EnvironmentOutlined style={{ fontSize: 32, color: '#f59e0b', marginBottom: 16 }} />
                                <Title level={4}>Địa Chỉ Sân</Title>
                                <Text strong style={{ fontSize: 18, color: '#0f172a' }}>{tenant?.address || `Khu vực ${domain}`}</Text>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div style={{ padding: '30px 20px', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                                <MailOutlined style={{ fontSize: 32, color: '#3b82f6', marginBottom: 16 }} />
                                <Title level={4}>Email</Title>
                                <Text strong style={{ fontSize: 18, color: '#0f172a' }}>support@{domain}.com</Text>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

        </div>
    );
};

export default CustomerHome;