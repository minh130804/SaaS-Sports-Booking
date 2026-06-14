import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, Typography, Card } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, WarningFilled } from '@ant-design/icons';

const { Text } = Typography;

const PaymentResult = () => {
    const { domain } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const s = searchParams.get('status');
        setStatus(s);
    }, [searchParams]);

    if (!status) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Spin size="large" tip="Đang xác thực kết quả thanh toán..." />
            </div>
        );
    }

    const isSuccess = status === 'success';
    const isFailed = status === 'failed';
    const bookingId = searchParams.get('bookingId');

    return (
        <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            minHeight: 'calc(100vh - 64px)', background: '#f8fafc', padding: 24 
        }}>
            <Card style={{ 
                maxWidth: 520, width: '100%', borderRadius: 24, 
                boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                border: `2px solid ${isSuccess ? '#10b981' : '#ef4444'}`,
                overflow: 'hidden'
            }}>

                <div style={{ 
                    height: 8, 
                    background: isSuccess 
                        ? 'linear-gradient(90deg, #10b981, #059669)' 
                        : 'linear-gradient(90deg, #ef4444, #dc2626)',
                    margin: '-24px -24px 24px -24px'
                }} />

                <Result
                    icon={
                        isSuccess 
                            ? <CheckCircleFilled style={{ color: '#10b981', fontSize: 72 }} />
                            : <CloseCircleFilled style={{ color: '#ef4444', fontSize: 72 }} />
                    }
                    title={
                        <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
                            {isSuccess ? '🎉 Thanh toán thành công!' : '❌ Thanh toán thất bại'}
                        </span>
                    }
                    subTitle={
                        <div style={{ fontSize: 15, color: '#64748b', marginTop: 8 }}>
                            {isSuccess ? (
                                <>
                                    Đơn đặt sân của bạn đã được xác nhận tự động.<br />
                                    {bookingId && <Text type="secondary">Mã đặt sân: <b>#{bookingId}</b></Text>}
                                </>
                            ) : (
                                <>
                                    Giao dịch không thành công hoặc đã bị huỷ.<br />
                                    Lịch đặt sân đã được huỷ. Vui lòng thử lại.
                                </>
                            )}
                        </div>
                    }
                    extra={[
                        isSuccess && (
                            <Button 
                                key="history"
                                type="primary" 
                                size="large"
                                style={{ 
                                    background: '#10b981', borderColor: '#10b981', 
                                    fontWeight: 700, borderRadius: 10, marginRight: 8 
                                }}
                                onClick={() => navigate(`/${domain}/history`)}
                            >
                                Xem lịch sử đặt sân
                            </Button>
                        ),
                        <Button 
                            key="back"
                            size="large"
                            style={{ fontWeight: 700, borderRadius: 10 }}
                            onClick={() => navigate(`/${domain}/booking`)}
                        >
                            {isSuccess ? 'Đặt sân khác' : 'Thử lại'}
                        </Button>
                    ]}
                />
            </Card>
        </div>
    );
};

export default PaymentResult;
