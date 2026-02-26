import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

export default function Login() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await login(values);
            navigate('/');
        } catch (error) {
            const msg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 16,
            }}
        >
            <Card
                style={{
                    width: 420,
                    borderRadius: 16,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    border: 'none',
                }}
                styles={{ body: { padding: '40px 32px' } }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}></div>
                    <Title level={2} style={{ margin: 0, color: '#1a1a2e' }}>
                        Wedding Services
                    </Title>
                    <Text type="secondary">Đăng nhập vào hệ thống quản lý</Text>
                </div>

                <Form
                    name="login"
                    onFinish={onFinish}
                    size="large"
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#667eea' }} />}
                            placeholder="Email"
                            style={{ borderRadius: 10, height: 48 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#667eea' }} />}
                            placeholder="Mật khẩu"
                            style={{ borderRadius: 10, height: 48 }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            style={{
                                height: 48,
                                borderRadius: 10,
                                fontWeight: 600,
                                fontSize: 16,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            }}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
