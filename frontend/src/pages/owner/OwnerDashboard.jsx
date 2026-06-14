import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Typography, Select, message, Spin, Statistic } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarOutlined, RiseOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';

const { Title } = Typography;
const { Option } = Select;

const OwnerDashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());
    const [totalRevenue, setTotalRevenue] = useState(0);

    const fetchRevenue = async (selectedYear) => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/statistics/owner-revenue?year=${selectedYear}`);
            setData(res.data.data);
            const total = res.data.data.reduce((sum, item) => sum + item.revenue, 0);
            setTotalRevenue(total);
        } catch (error) {
            message.error("Lỗi khi tải thống kê doanh thu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenue(year);
    }, [year]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={2} style={{ color: '#0f172a' }}>Thống kê Doanh thu Đặt sân</Title>
                <Select 
                    value={year} 
                    onChange={(val) => setYear(val)} 
                    style={{ width: 120 }}
                    size="large"
                >
                    {[year - 2, year - 1, year, year + 1].map(y => (
                        <Option key={y} value={y}>Năm {y}</Option>
                    ))}
                </Select>
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
                        <Statistic
                            title={<span style={{ fontSize: 16, color: '#64748b' }}>Tổng doanh thu năm {year}</span>}
                            value={totalRevenue}
                            formatter={formatCurrency}
                            valueStyle={{ color: '#10b981', fontWeight: 800, fontSize: 32 }}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
                        <Statistic
                            title={<span style={{ fontSize: 16, color: '#64748b' }}>Tháng có doanh thu cao nhất</span>}
                            value={data.length > 0 ? Math.max(...data.map(d => d.revenue)) : 0}
                            formatter={formatCurrency}
                            valueStyle={{ color: '#3b82f6', fontWeight: 800, fontSize: 32 }}
                            prefix={<RiseOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
                <Title level={4} style={{ marginBottom: 24, color: '#334155' }}>Biểu đồ tăng trưởng</Title>
                {loading ? <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin size="large" /></div> : (
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <AreaChart
                                data={data}
                                margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(val) => `${val / 1000000}M`} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default OwnerDashboard;
