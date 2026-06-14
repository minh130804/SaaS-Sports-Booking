import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Space, message, Tag } from 'antd';
import { 
    AppstoreOutlined, TeamOutlined, CalendarOutlined, 
    UserOutlined, LogoutOutlined, AreaChartOutlined, GlobalOutlined, ShoppingOutlined, SettingOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const OwnerLayout = () => {
    const { domain } = useParams();

    const token = localStorage.getItem('accessToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

    if (!token || !userInfo) {
        return <Navigate to={`/${domain}/login`} replace />;
    }

    if (userInfo.role === 'SUPER_ADMIN' || userInfo.role === 'CUSTOMER') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        return <Navigate to={`/${domain}/login`} replace />;
    }

    const [collapsed, setCollapsed] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isOwner = userInfo.role === 'OWNER';

    React.useEffect(() => {
        if (!isOwner) return; // Nhân viên không cần check plan
        const fetchPlan = async () => {
            try {
                const { default: axiosClient } = await import('../api/axiosClient');
                const res = await axiosClient.get('/tenants/my-plan');
                const tenant = res.data.data;
                if (tenant.subscription_end_date && new Date(tenant.subscription_end_date) < new Date()) {
                    setIsExpired(true);
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin plan", error);
            }
        };
        fetchPlan();
    }, [isOwner]);

    // Điều hướng nhân viên khỏi trang dashboard
    React.useEffect(() => {
        if (!isOwner && (location.pathname === `/${domain}/owner` || location.pathname === `/${domain}/owner/dashboard`)) {
            navigate(`/${domain}/owner/bookings`);
        }
    }, [isOwner, location.pathname, domain, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        message.success('Đã đăng xuất thành công!');

        window.location.href = `/${domain}/login`; 
    };

    const menuItems = isOwner ? [
        { key: `/${domain}/owner/dashboard`, icon: <AreaChartOutlined />, label: 'Thống kê Doanh thu' },
        { type: 'divider' },
        { key: `/${domain}/owner/fields`, icon: <AppstoreOutlined />, label: 'Quản lý Sân bóng' },
        { key: `/${domain}/owner/bookings`, icon: <CalendarOutlined />, label: 'Quản lý Lịch đặt' },
        { key: `/${domain}/owner/offline-booking`, icon: <ShoppingOutlined />, label: 'Đặt sân tại quầy' },
        { key: `/${domain}/owner/customers`, icon: <UserOutlined />, label: 'Quản lý Khách hàng' },
        { key: `/${domain}/owner/staffs`, icon: <TeamOutlined />, label: 'Quản lý Nhân viên' },
        { type: 'divider' },
        { key: `/${domain}/owner/settings`, icon: <SettingOutlined />, label: 'Cài đặt hệ thống' },
        { key: `/${domain}/owner/plans`, icon: <ShoppingOutlined />, label: 'Gói cước & Thanh toán' }
    ] : [
        { key: `/${domain}/owner/bookings`, icon: <CalendarOutlined />, label: 'Quản lý Lịch đặt' },
        { key: `/${domain}/owner/offline-booking`, icon: <ShoppingOutlined />, label: 'Đặt sân tại quầy' },
    ];

    const userMenu = {
        items: [
            { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân (Đổi mật khẩu)', onClick: () => navigate(`/${domain}/owner/profile`) },
            { type: 'divider' },
            { key: 'logout', danger: true, icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout }
        ]
    };

    const displayRole = userInfo.role === 'OWNER' ? 'Owner' : 'Staff';

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light" style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}>

                <div style={{ height: 64, margin: 16, color: '#10b981', fontSize: 18, fontWeight: 'bold', textAlign: 'center', lineHeight: '32px', textTransform: 'uppercase', overflow: 'hidden' }}>
                    {collapsed ? 'SÂN' : domain}
                </div>
                
                <Menu 
                    mode="inline" 
                    selectedKeys={[location.pathname]} 
                    items={menuItems} 
                    onClick={(e) => navigate(e.key)} 
                />
            </Sider>

            <Layout>
                <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 10, fontWeight: 500, color: '#555' }}>Tên miền hoạt động:</span>
                        <Tag icon={<GlobalOutlined />} color="processing" style={{ fontSize: 14, padding: '4px 10px', borderRadius: 6 }}>
                            {domain.toUpperCase()}
                        </Tag>
                    </div>

                    <Dropdown menu={userMenu} placement="bottomRight">
                        <Button type="text" size="large">
                            <Space>
                                <UserOutlined />
                                {userInfo.full_name} ({displayRole})
                            </Space>
                        </Button>
                    </Dropdown>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8, overflow: 'auto' }}>
                    {isExpired && !location.pathname.includes('/plans') && !location.pathname.includes('/subscription-result') ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: 64, marginBottom: 20 }}>🔒</div>
                            <h2 style={{ color: '#cf1322', fontSize: 24, marginBottom: 16 }}>Hệ thống đang bị khoá!</h2>
                            <p style={{ color: '#555', fontSize: 16, maxWidth: 500, margin: '0 auto 30px' }}>
                                Gói cước của bạn đã hết hạn nên hệ thống tạm thời bảo trì. Để tiếp tục sử dụng các chức năng quản lý, nhận lịch đặt sân, vui lòng thanh toán gia hạn.
                            </p>
                            {isOwner && (
                                <Button type="primary" size="large" style={{ background: '#cf1322', borderColor: '#cf1322', fontWeight: 'bold' }} onClick={() => navigate(`/${domain}/owner/plans`)}>
                                    GIA HẠN NGAY
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {isExpired && (
                                <div style={{ marginBottom: 20, padding: '12px 20px', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong style={{ color: '#cf1322', fontSize: 16 }}>Gói cước đã hết hạn!</strong>
                                        <p style={{ margin: '4px 0 0', color: '#d4380d' }}>Vui lòng thanh toán để mở khóa hệ thống.</p>
                                    </div>
                                </div>
                            )}
                            <Outlet />
                        </>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
};

export default OwnerLayout;