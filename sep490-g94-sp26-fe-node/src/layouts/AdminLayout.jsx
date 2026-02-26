import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Layout,
    Menu,
    Button,
    Avatar,
    Dropdown,
    Typography,
    theme,
} from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    TeamOutlined,
    ContactsOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    SettingOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    GiftOutlined,
    ShopOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import roleApi from '../api/roleApi';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// All menu items with role restrictions
// roles: undefined = everyone, array = only those roles
const allMenuItems = [
    {
        key: '/',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        roles: ['ADMIN', 'MANAGER'],
    },
    {
        type: 'group',
        label: 'Quản lý người dùng',
        roles: ['ADMIN', 'MANAGER'],
        children: [
            { key: '/users', icon: <UserOutlined />, label: 'Người dùng', roles: ['ADMIN'] },
            { key: '/leads', icon: <ContactsOutlined />, label: 'Leads', roles: ['ADMIN', 'MANAGER'] },
            { key: '/customers', icon: <TeamOutlined />, label: 'Khách hàng', roles: ['ADMIN', 'MANAGER'] },
        ],
    },
    {
        type: 'group',
        label: 'Quản lý dịch vụ',
        roles: ['ADMIN', 'MANAGER'],
        children: [
            { key: '/locations', icon: <EnvironmentOutlined />, label: 'Địa điểm', roles: ['ADMIN'] },
            { key: '/halls', icon: <HomeOutlined />, label: 'Hội trường', roles: ['ADMIN', 'MANAGER'] },
            { key: '/services', icon: <GiftOutlined />, label: 'Dịch vụ', roles: ['ADMIN', 'MANAGER'] },
        ],
    },
    {
        type: 'group',
        label: 'Kinh doanh',
        roles: ['MANAGER', 'SALE'],
        children: [
            { key: '/sales', icon: <ShopOutlined />, label: 'Sales', roles: ['MANAGER', 'SALE'] },
        ],
    },
];

function filterMenuByRole(items, roleName) {
    if (!roleName) return items;
    const upper = roleName.toUpperCase();
    return items
        .filter((item) => !item.roles || item.roles.includes(upper))
        .map((item) => {
            if (item.children) {
                const filteredChildren = item.children.filter(
                    (child) => !child.roles || child.roles.includes(upper)
                );
                if (filteredChildren.length === 0) return null;
                return { ...item, children: filteredChildren };
            }
            return item;
        })
        .filter(Boolean);
}

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [roleName, setRoleName] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { token: themeToken } = theme.useToken();

    useEffect(() => {
        const fetchRole = async () => {
            if (!user?.roleId) return;
            try {
                const res = await roleApi.getAll({ size: 100 });
                const roles = res.data.data?.content || [];
                const found = roles.find((r) => r.id === user.roleId);
                if (found) {
                    setRoleName(found.code || found.name);
                }
            } catch { /* ignore */ }
        };
        fetchRole();
    }, [user?.roleId]);

    // Redirect sale to /sales on first load
    useEffect(() => {
        if (roleName && roleName.toUpperCase() === 'SALE' && location.pathname === '/') {
            navigate('/sales');
        }
    }, [roleName, location.pathname, navigate]);

    const menuItems = filterMenuByRole(allMenuItems, roleName);

    const handleMenuClick = (e) => {
        navigate(e.key);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    background: 'linear-gradient(180deg, #001529 0%, #002140 100%)',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
                }}
            >
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <Text
                        strong
                        style={{
                            color: '#fff',
                            fontSize: collapsed ? 16 : 20,
                            letterSpacing: 1,
                            transition: 'all 0.3s',
                        }}
                    >
                        {collapsed ? 'WL' : ' WeddingLink'}
                    </Text>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        background: 'transparent',
                        borderRight: 0,
                        marginTop: 8,
                    }}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: '0 24px',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: 18, width: 48, height: 48 }}
                    />
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                cursor: 'pointer',
                                padding: '4px 12px',
                                borderRadius: 8,
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = themeToken.colorBgTextHover)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            <Avatar
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                }}
                                icon={<UserOutlined />}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                                <Text strong style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.fullName || user?.email || 'Admin'}
                                </Text>
                                {roleName && (
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        {roleName}
                                    </Text>
                                )}
                            </div>
                        </div>
                    </Dropdown>
                </Header>
                <Content
                    style={{
                        margin: 24,
                        padding: 24,
                        background: themeToken.colorBgContainer,
                        borderRadius: themeToken.borderRadiusLG,
                        minHeight: 280,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
