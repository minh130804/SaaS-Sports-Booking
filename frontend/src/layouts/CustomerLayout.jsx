import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Space, Typography, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, HistoryOutlined, EnvironmentOutlined, HomeOutlined, AppstoreOutlined, PhoneOutlined, DashboardOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const CustomerLayout = () => {
    const { domain } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [scrolled, setScrolled] = useState(false);
    const [fieldTypes, setFieldTypes] = useState([]);
    const [isExpired, setIsExpired] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

    const [tenantInfo, setTenantInfo] = useState(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        const fetchTypes = async () => {
            try {
                const res = await axiosClient.get(`/public/fields/${domain}`);
                if (res.data.tenant && res.data.tenant.isExpired) {
                    setIsExpired(true);
                }
                setTenantInfo(res.data.tenant);
                const types = [...new Set(res.data.data.map(f => f.type))];
                setFieldTypes(types);
            } catch (error) {
                console.error("Lỗi tải loại sân", error);
            }
        };
        fetchTypes();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [domain]);

    if (userInfo && userInfo.role === 'SUPER_ADMIN') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (isExpired) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', padding: 20, textAlign: 'center' }}>
                <Title level={2} style={{ color: '#1e293b' }}>Hệ thống đang bảo trì</Title>
                <Text style={{ fontSize: 16, color: '#64748b', maxWidth: 500, marginBottom: 30 }}>
                    Trang web của hệ thống sân <b>{domain}</b> hiện đang tạm ngưng hoạt động do gói cước đã hết hạn. Vui lòng quay lại sau hoặc liên hệ chủ sân.
                </Text>
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('accessToken');
        window.location.href = `/${domain}`; 
    };

    const userMenuItems = [];
    if (userInfo?.role === 'CUSTOMER') {
        userMenuItems.push({ key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân', onClick: () => navigate(`/${domain}/profile`) });
        userMenuItems.push({ key: 'history', icon: <HistoryOutlined />, label: 'Lịch sử đặt sân', onClick: () => navigate(`/${domain}/history`) });
        userMenuItems.push({ type: 'divider' });
    } else if (userInfo?.role === 'OWNER' || userInfo?.role === 'STAFF') {
        userMenuItems.push({ key: 'dashboard', icon: <DashboardOutlined />, label: 'Vào Trang Quản Lý', onClick: () => navigate(`/${domain}/owner/dashboard`) });
        userMenuItems.push({ type: 'divider' });
    }
    userMenuItems.push({ key: 'logout', danger: true, icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout });

    const scrollToContact = () => {
        if (location.pathname !== `/${domain}`) {
            navigate(`/${domain}`);
            setTimeout(() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' }), 500);
        } else {
            document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const menuItems = [
        { key: `/${domain}`, icon: <HomeOutlined />, label: 'Trang Chủ', onClick: () => navigate(`/${domain}`) },
        { 
            key: 'type', 
            icon: <AppstoreOutlined />, 
            label: 'Chọn Loại Sân',
            children: [
                { key: `/${domain}/fields`, label: 'Tất cả các sân', onClick: () => navigate(`/${domain}/fields`) },
                ...fieldTypes.map(type => ({
                    key: `/${domain}/fields?type=${type}`,
                    label: `Sân ${type}`,
                    onClick: () => navigate(`/${domain}/fields?type=${type}`)
                }))
            ]
        },
        ...(userInfo?.role === 'CUSTOMER' || !userInfo ? [{ key: `/${domain}/history`, icon: <HistoryOutlined />, label: 'Lịch Sử Đặt Sân', onClick: () => navigate(`/${domain}/history`) }] : []),
        { key: 'contact', icon: <PhoneOutlined />, label: 'Liên Hệ', onClick: scrollToContact },
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            <Header 
                style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, boxSizing: 'border-box',
                    background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'white',
                    backdropFilter: scrolled ? 'blur(10px)' : 'none',
                    boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.05)' : '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s ease',
                    padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
            >
                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/${domain}`)}>
                    {tenantInfo?.logo_url ? (
                        <img src={tenantInfo.logo_url} alt="Logo" style={{ width: 40, height: 40, borderRadius: 10, marginRight: 12, objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                            <EnvironmentOutlined style={{ color: 'white', fontSize: 20 }} />
                        </div>
                    )}
                    <Title level={3} style={{ margin: 0, color: '#0f172a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {tenantInfo?.name || `${domain} SPORTS`}
                    </Title>
                </div>

                <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', justifyContent: 'center' }}>
                    <Menu 
                        mode="horizontal" 
                        selectedKeys={[location.pathname]} 
                        style={{ background: 'transparent', borderBottom: 'none', fontWeight: 600, fontSize: 15, width: '100%', justifyContent: 'center' }}
                        items={menuItems}
                    />
                </div>

                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
                    {userInfo ? (
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 16px', background: '#f1f5f9', borderRadius: 50, border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                                <Avatar style={{ backgroundColor: '#10b981' }} icon={<UserOutlined />} size="small" />
                                <Text strong style={{ color: '#334155' }}>{userInfo.full_name}</Text>
                            </div>
                        </Dropdown>
                    ) : (
                        <Space size="middle">

                            <Button type="text" size="large" onClick={() => navigate(`/${domain}/login?mode=register`)} style={{ fontWeight: 600, color: '#475569' }}>
                                Đăng Ký
                            </Button>
                            
                            <Button type="primary" size="large" onClick={() => navigate(`/${domain}/login`)} style={{ background: '#10b981', borderColor: '#10b981', borderRadius: 8, fontWeight: 600 }}>
                                Đăng Nhập
                            </Button>
                        </Space>
                    )}
                </div>
            </Header>

            <Content style={{ paddingTop: 64, flex: 1 }}>
                <Outlet />
            </Content>

            <Footer style={{ textAlign: 'center', background: '#0f172a', color: '#94a3b8', padding: '40px 20px' }}>
                <Title level={4} style={{ color: 'white', margin: 0 }}>{domain.toUpperCase()} SPORTS</Title>
                <p style={{ marginTop: 10 }}>Hệ thống quản lý và đặt lịch sân thể thao tự động hóa.</p>
                <p>©2026 Crafted with ❤️ for Sports Lovers.</p>
            </Footer>
        </Layout>
    );
};

export default CustomerLayout;