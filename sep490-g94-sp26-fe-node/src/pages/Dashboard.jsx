import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    ContactsOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import userApi from '../api/userApi';
import leadApi from '../api/leadApi';
import customerApi from '../api/customerApi';

const { Title } = Typography;

export default function Dashboard() {
    const [stats, setStats] = useState({ users: 0, leads: 0, customers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, leadsRes, customersRes] = await Promise.allSettled([
                    userApi.getAll({ page: 0, size: 1 }),
                    leadApi.getAll({ page: 0, size: 1 }),
                    customerApi.getAll({ page: 0, size: 1 }),
                ]);

                setStats({
                    users: usersRes.status === 'fulfilled' ? usersRes.value.data.data?.totalElements || 0 : 0,
                    leads: leadsRes.status === 'fulfilled' ? leadsRes.value.data.data?.totalElements || 0 : 0,
                    customers: customersRes.status === 'fulfilled' ? customersRes.value.data.data?.totalElements || 0 : 0,
                });
            } catch {
                // keep defaults
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        {
            title: 'Tổng người dùng',
            value: stats.users,
            icon: <UserOutlined style={{ fontSize: 32 }} />,
            color: '#667eea',
            bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
            title: 'Khách hàng tiềm năng',
            value: stats.leads,
            icon: <ContactsOutlined style={{ fontSize: 32 }} />,
            color: '#f093fb',
            bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        {
            title: 'Khách hàng',
            value: stats.customers,
            icon: <TeamOutlined style={{ fontSize: 32 }} />,
            color: '#4facfe',
            bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        {
            title: 'Tăng trưởng',
            value: '12%',
            icon: <RiseOutlined style={{ fontSize: 32 }} />,
            color: '#43e97b',
            bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 80 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>
                 Dashboard
            </Title>
            <Row gutter={[24, 24]}>
                {cards.map((card, i) => (
                    <Col xs={24} sm={12} lg={6} key={i}>
                        <Card
                            hoverable
                            style={{
                                borderRadius: 16,
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                overflow: 'hidden',
                            }}
                            styles={{ body: { padding: 24 } }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Statistic
                                    title={
                                        <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                                            {card.title}
                                        </span>
                                    }
                                    value={card.value}
                                    valueStyle={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}
                                />
                                <div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 16,
                                        background: card.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                    }}
                                >
                                    {card.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
