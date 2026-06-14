import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, List, Tag, message, Spin, Space } from 'antd';
import { CheckCircleOutlined, ThunderboltOutlined, GiftOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient'; 

const { Title, Text } = Typography;

const PlanSelection = () => {
    const [plans, setPlans] = useState([]);
    const [currentPlanId, setCurrentPlanId] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submittingId, setSubmittingId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {

            const plansRes = await axiosClient.get('/plans');

            const myPlanRes = await axiosClient.get('/tenants/my-plan');
            
            setPlans(plansRes.data.data);
            setCurrentPlanId(myPlanRes.data.data.plan_id);
            if (myPlanRes.data.data.subscription_end_date && new Date(myPlanRes.data.data.subscription_end_date) < new Date()) {
                setIsExpired(true);
            }
        } catch (error) {
            message.error('Lỗi khi tải thông tin gói cước');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpgrade = async (planId, billingCycle) => {
        setSubmittingId(planId);
        try {
            if (planId === 1) {

                await axiosClient.put('/tenants/my-plan', { plan_id: planId });
                message.success('🎉 Đã chuyển về gói Free!');
                setCurrentPlanId(planId);
            } else {

                const res = await axiosClient.post('/subscriptions/create-payment-url', { 
                    planId, 
                    billingCycle 
                });
                if (res.data.paymentUrl) {
                    window.location.href = res.data.paymentUrl;
                }
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi nâng cấp gói cước');
        } finally {
            setSubmittingId(null);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Đang tải danh sách gói cước..." />
            </div>
        );
    }

    return (
        <div style={{ padding: '30px 20px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 50 }}>
                <Title level={1} style={{ fontSize: 36, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>
                    Nâng cấp Gói dịch vụ
                </Title>
                <Text type="secondary" style={{ fontSize: 18, color: '#64748b' }}>
                    Chọn gói cước phù hợp để mở khóa giới hạn sân và nhân viên cho hệ thống của bạn.
                </Text>
            </div>

            <Row gutter={[32, 32]} justify="center">
                {plans.map(plan => {
                    const isCurrent = currentPlanId === plan.id;

                    const isPopular = plan.id === 3; 

                    return (
                        <Col xs={24} md={12} lg={8} key={plan.id}>
                            <Card 
                                hoverable
                                style={{ 
                                    borderRadius: 20, 
                                    border: isPopular ? '2px solid #764ba2' : (isCurrent ? '2px solid #10b981' : '1px solid #e2e8f0'),
                                    transform: isPopular ? 'scale(1.03)' : 'none',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isPopular 
                                        ? '0 20px 40px rgba(118, 75, 162, 0.12)' 
                                        : (isCurrent ? '0 10px 20px rgba(16, 185, 129, 0.08)' : '0 10px 20px rgba(0, 0, 0, 0.02)')
                                }}
                                bodyStyle={{ padding: '40px 30px', position: 'relative' }}
                            >
                                {isPopular && (
                                    <Tag color="#764ba2" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '6px 20px', borderRadius: 20, fontSize: 13, fontWeight: 800, border: 'none', boxShadow: '0 4px 10px rgba(118,75,162,0.3)' }}>
                                        <ThunderboltOutlined /> KHUYÊN DÙNG
                                    </Tag>
                                )}
                                
                                {isCurrent && (
                                    <Tag color="#10b981" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '6px 20px', borderRadius: 20, fontSize: 13, fontWeight: 800, border: 'none', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>
                                        <CheckCircleOutlined /> GÓI HIỆN TẠI
                                    </Tag>
                                )}

                                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                                    <Title level={3} style={{ color: '#0f172a', fontWeight: 800, marginBottom: 8, marginTop: 10 }}>
                                        {plan.name}
                                    </Title>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', margin: '20px 0' }}>
                                        <span style={{ fontSize: 36, fontWeight: 800, color: isPopular ? '#764ba2' : '#0f172a' }}>
                                            {plan.id === 1 ? 'Miễn phí' : `${Number(plan.monthly_price).toLocaleString()}đ`}
                                        </span>
                                        {plan.id !== 1 && <span style={{ fontSize: 15, color: '#64748b', marginLeft: 4 }}>/ tháng</span>}
                                    </div>
                                    {plan.id !== 1 && (
                                        <Text type="secondary" style={{ display: 'block', fontSize: 14, color: '#64748b' }}>
                                            Hoặc thanh toán năm: <b>{Number(plan.yearly_price).toLocaleString()}đ</b>
                                        </Text>
                                    )}
                                </div>

                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 24, marginBottom: 32 }}>
                                    <List
                                        split={false}
                                        dataSource={[
                                            plan.max_fields >= 999 ? 'Không giới hạn số lượng sân' : `Quản lý tối đa: ${plan.max_fields} sân bóng`,
                                            plan.max_staffs >= 999 ? 'Không giới hạn tài khoản nhân viên' : `Hỗ trợ tối đa: ${plan.max_staffs} nhân viên`,
                                            plan.id === 1 ? 'Tính năng quản lý cơ bản' : 'Đầy đủ tính năng cao cấp',
                                            plan.id === 3 ? 'Hỗ trợ VIP 24/7' : 'Hỗ trợ trong giờ hành chính'
                                        ]}
                                        renderItem={item => (
                                            <List.Item style={{ padding: '8px 0' }}>
                                                <Space align="start">
                                                    <CheckCircleOutlined style={{ color: '#10b981', fontSize: 16, marginTop: 4 }} />
                                                    <span style={{ color: '#334155', fontSize: 15 }}>{item}</span>
                                                </Space>
                                            </List.Item>
                                        )}
                                    />
                                </div>

                                {isCurrent ? (
                                    isExpired ? (
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Button 
                                                type="primary" size="large" block shape="round"
                                                onClick={() => handleUpgrade(plan.id, 'MONTHLY')}
                                                loading={submittingId === plan.id}
                                                style={{ height: 48, fontWeight: 800, fontSize: 16, background: isPopular ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#10b981', border: 'none', boxShadow: isPopular ? '0 8px 20px rgba(118, 75, 162, 0.25)' : 'none' }}
                                            >
                                                Gia hạn Tháng
                                            </Button>
                                            <Button 
                                                type="default" size="large" block shape="round"
                                                onClick={() => handleUpgrade(plan.id, 'YEARLY')}
                                                loading={submittingId === plan.id}
                                                style={{ height: 48, fontWeight: 800, fontSize: 16, color: isPopular ? '#764ba2' : '#10b981', borderColor: isPopular ? '#764ba2' : '#10b981' }}
                                            >
                                                Gia hạn Năm
                                            </Button>
                                        </Space>
                                    ) : (
                                        <Button 
                                            type="default" size="large" block shape="round" disabled
                                            style={{ height: 48, fontWeight: 800, fontSize: 16, background: '#f1f5f9', color: '#64748b' }}
                                        >
                                            Đang hoạt động
                                        </Button>
                                    )
                                ) : plan.id < currentPlanId ? (
                                    plan.id === 1 ? (
                                        <Button 
                                            type="primary" size="large" block shape="round"
                                            onClick={() => handleUpgrade(plan.id, 'MONTHLY')}
                                            loading={submittingId === plan.id}
                                            style={{ height: 48, fontWeight: 800, fontSize: 16, background: '#10b981', borderColor: '#10b981' }}
                                        >
                                            Kích hoạt gói Free
                                        </Button>
                                    ) : (
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Button 
                                                type="primary" size="large" block shape="round"
                                                onClick={() => handleUpgrade(plan.id, 'MONTHLY')}
                                                loading={submittingId === plan.id}
                                                style={{ height: 48, fontWeight: 800, fontSize: 16, background: '#f59e0b', borderColor: '#f59e0b', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}
                                            >
                                                Hạ cấp Tháng
                                            </Button>
                                            <Button 
                                                type="default" size="large" block shape="round"
                                                onClick={() => handleUpgrade(plan.id, 'YEARLY')}
                                                loading={submittingId === plan.id}
                                                style={{ height: 48, fontWeight: 800, fontSize: 16, color: '#f59e0b', borderColor: '#f59e0b' }}
                                            >
                                                Hạ cấp Năm
                                            </Button>
                                        </Space>
                                    )
                                ) : (
                                    plan.id === 1 ? (
                                        <Button 
                                            type="primary" size="large" block shape="round"
                                            onClick={() => handleUpgrade(plan.id, 'MONTHLY')}
                                            loading={submittingId === plan.id}
                                            style={{ height: 48, fontWeight: 800, fontSize: 16, background: '#10b981', borderColor: '#10b981' }}
                                        >
                                            Kích hoạt gói Free
                                        </Button>
                                    ) : (
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Button 
                                                type="primary" size="large" block shape="round"
                                                onClick={() => handleUpgrade(plan.id, 'MONTHLY')}
                                                loading={submittingId === plan.id}
                                                style={{ height: 48, fontWeight: 800, fontSize: 16, background: isPopular ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#10b981', border: 'none', boxShadow: isPopular ? '0 8px 20px rgba(118, 75, 162, 0.25)' : 'none' }}
                                            >
                                                Thanh toán Tháng
                                            </Button>
                                            <Button 
                                                type="default" size="large" block shape="round"
                                                onClick={() => handleUpgrade(plan.id, 'YEARLY')}
                                                loading={submittingId === plan.id}
                                                style={{ height: 48, fontWeight: 800, fontSize: 16, color: isPopular ? '#764ba2' : '#10b981', borderColor: isPopular ? '#764ba2' : '#10b981' }}
                                            >
                                                Thanh toán Năm
                                            </Button>
                                        </Space>
                                    )
                                )}
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default PlanSelection;