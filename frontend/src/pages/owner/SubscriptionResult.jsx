import React from 'react';
import { Result, Button, Card } from 'antd';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

const SubscriptionResult = () => {
    const navigate = useNavigate();
    const { domain } = useParams();
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: 20 }}>
            <Card style={{ borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: 500, width: '100%', textAlign: 'center' }}>
                {status === 'success' ? (
                    <Result
                        status="success"
                        title="Thanh toán Thành công!"
                        subTitle="Cảm ơn bạn. Gói cước của bạn đã được gia hạn/nâng cấp thành công."
                        extra={[
                            <Button 
                                type="primary" 
                                key="console" 
                                size="large"
                                onClick={() => navigate(`/${domain}/owner/dashboard`)}
                                style={{ borderRadius: 8, background: '#10b981', borderColor: '#10b981', fontWeight: 600 }}
                            >
                                Về Bảng Điều Khiển
                            </Button>,
                            <Button 
                                key="buy" 
                                size="large"
                                onClick={() => navigate(`/${domain}/owner/plans`)}
                                style={{ borderRadius: 8 }}
                            >
                                Xem Gói Cước
                            </Button>,
                        ]}
                    />
                ) : (
                    <Result
                        status="error"
                        title="Thanh toán Thất bại"
                        subTitle="Rất tiếc, giao dịch của bạn không thành công hoặc đã bị hủy."
                        extra={[
                            <Button 
                                type="primary" 
                                key="console" 
                                size="large"
                                onClick={() => navigate(`/${domain}/owner/plans`)}
                                style={{ borderRadius: 8, fontWeight: 600 }}
                            >
                                Thử Lại
                            </Button>
                        ]}
                    />
                )}
            </Card>
        </div>
    );
};

export default SubscriptionResult;
