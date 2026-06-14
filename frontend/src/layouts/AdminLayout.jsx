import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Space, message } from 'antd';
import { 
    DashboardOutlined, 
    ShopOutlined, 
    UserOutlined, 
    LogoutOutlined,
    GiftOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const token = localStorage.getItem('accessToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

    if (!token || !userInfo || userInfo.role !== 'SUPER_ADMIN') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        return <Navigate to="/admin/login" replace />;
    }

    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        message.success('Đã đăng xuất khỏi tài khoản Quản trị viên!');
        navigate('/admin/login');
    };

    const menuItems = [
        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Bảng Điều Khiển' },
        { key: '/admin/tenants', icon: <ShopOutlined />, label: 'Quản lý Hệ Thống Sân' },
        { key: '/admin/plans', icon: <GiftOutlined />, label: 'Quản lý Gói Cước' },
        { key: '/admin/payments', icon: <DollarOutlined />, label: 'Lịch sử Thanh toán' },
    ];

    const userMenu = {
        items: [
            { key: 'logout', danger: true, icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout }
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark">
                <div style={{ height: 64, margin: 16, color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', lineHeight: '32px' }}>
                    {collapsed ? 'SAAS' : 'SAAS ADMIN'}
                </div>
                
                <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={(e) => navigate(e.key)} />
            </Sider>

            <Layout>
                <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
                    <Dropdown menu={userMenu} placement="bottomRight">
                        <Button type="text" size="large">
                            <Space>
                                <UserOutlined />
                                {userInfo.full_name} (Super Admin)
                            </Space>
                        </Button>
                    </Dropdown>
                </Header>

                <Content style={{ margin: 0, padding: 24, background: '#fff', overflow: 'auto' }}>
                    <Outlet /> 
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;