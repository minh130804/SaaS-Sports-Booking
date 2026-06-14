import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Tag, Spin, Button, Radio, Select, Empty } from 'antd';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'; 
import { EnvironmentOutlined, ClockCircleOutlined, TrophyOutlined, FilterOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';

const { Title, Text } = Typography;
const { Option } = Select;

const FieldsPage = () => {
    const { domain } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialType = searchParams.get('type') || 'ALL';

    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState(initialType);
    const [selectedAddress, setSelectedAddress] = useState('ALL');

    useEffect(() => {
        const fetchFields = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/public/fields/${domain}`);
                setFields(response.data.data);
            } catch (error) {
                console.error("Lỗi tải sân", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFields();
    }, [domain]);

    useEffect(() => {
        setSelectedType(searchParams.get('type') || 'ALL');
        setSelectedAddress('ALL'); // Reset địa chỉ khi đổi loại sân
    }, [searchParams]);

    const availableTypes = [...new Set(fields.map(f => f.type))];
    const availableAddresses = selectedType === 'ALL' 
        ? [] 
        : [...new Set(fields.filter(f => f.type === selectedType).map(f => f.address))];

    const displayedFields = fields.filter(f => {
        const matchType = selectedType === 'ALL' || f.type === selectedType;
        const matchAddress = selectedAddress === 'ALL' || f.address === selectedAddress;
        return matchType && matchAddress;
    });

    const handleTypeChange = (e) => {
        const val = e.target.value;
        setSelectedType(val);
        setSelectedAddress('ALL');
        if (val === 'ALL') setSearchParams({});
        else setSearchParams({ type: val });
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 64px)', paddingBottom: 60 }}>

            <div style={{ background: '#0f172a', padding: '40px 20px', textAlign: 'center', marginBottom: 40 }}>
                <Title level={2} style={{ color: 'white', margin: 0 }}>Danh Sách Sân Thể Thao</Title>
                <Text style={{ color: '#94a3b8', fontSize: 16 }}>Tìm kiếm và chọn sân phù hợp nhất với bạn</Text>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto 40px', padding: '0 20px' }}>
                <div style={{ background: 'white', padding: '24px 32px', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <FilterOutlined style={{ color: '#10b981', fontSize: 20 }} />
                        <Title level={4} style={{ margin: 0, color: '#0f172a' }}>Bộ lọc tìm kiếm</Title>
                    </div>
                    
                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} md={selectedType === 'ALL' ? 24 : 12}>
                            <Text strong style={{ display: 'block', marginBottom: 8, color: '#475569' }}>Loại sân thể thao:</Text>
                            <Radio.Group 
                                value={selectedType} 
                                onChange={handleTypeChange}
                                buttonStyle="solid"
                                size="large"
                                style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}
                            >
                                <Radio.Button value="ALL" style={{ borderRadius: 8 }}>Tất cả</Radio.Button>
                                {availableTypes.map(type => (
                                    <Radio.Button key={type} value={type} style={{ borderRadius: 8 }}>{type}</Radio.Button>
                                ))}
                            </Radio.Group>
                        </Col>

                        {selectedType !== 'ALL' && (
                            <Col xs={24} md={12}>
                                <Text strong style={{ display: 'block', marginBottom: 8, color: '#475569' }}>Khu vực / Địa chỉ:</Text>
                                <Select 
                                    size="large"
                                    value={selectedAddress}
                                    onChange={setSelectedAddress}
                                    style={{ width: '100%' }}
                                    dropdownStyle={{ borderRadius: 8 }}
                                >
                                    <Option value="ALL">Tất cả khu vực</Option>
                                    {availableAddresses.map(address => (
                                        <Option key={address} value={address}>{address}</Option>
                                    ))}
                                </Select>
                            </Col>
                        )}
                    </Row>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                {loading ? <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div> : 
                 displayedFields.length === 0 ? (
                    <div style={{ background: 'white', padding: 50, borderRadius: 16, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                        <Empty description="Không tìm thấy sân nào phù hợp với bộ lọc!" />
                    </div>
                 ) : (
                    <Row gutter={[32, 32]}>
                        {displayedFields.map(field => (
                            <Col xs={24} sm={12} lg={8} key={field.id}>
                                <Card 
                                    hoverable
                                    bodyStyle={{ padding: 24 }}
                                    style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: 'all 0.3s', height: '100%' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    cover={
                                        <div style={{ 
                                            height: 180, position: 'relative',
                                            background: `linear-gradient(135deg, ${field.type.toLowerCase().includes('bóng đá') ? '#22c55e, #166534' : '#3b82f6, #1e3a8a'})`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <TrophyOutlined style={{ fontSize: 60, color: 'rgba(255,255,255,0.15)', position: 'absolute', right: -10, bottom: -10 }} />
                                            <Title level={3} style={{ color: 'white', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{field.name}</Title>
                                        </div>
                                    }
                                >
                                    <Tag color="cyan" style={{ padding: '4px 12px', borderRadius: 6, fontWeight: 600, fontSize: 12, marginBottom: 16 }}>{field.type.toUpperCase()}</Tag>
                                    
                                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <EnvironmentOutlined style={{ color: '#10b981', fontSize: 16, marginRight: 8, marginTop: 4 }}/> 
                                        <Text style={{ color: '#475569', fontSize: 14 }}>{field.address}</Text>
                                    </div>

                                    <Button 
                                        type="primary" block size="large" 
                                        onClick={() => navigate(`/${domain}/booking?fieldId=${field.id}`)}
                                        style={{ borderRadius: 10, background: '#0f172a', fontWeight: 600 }}
                                    >
                                        XEM LỊCH & ĐẶT NGAY
                                    </Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default FieldsPage;