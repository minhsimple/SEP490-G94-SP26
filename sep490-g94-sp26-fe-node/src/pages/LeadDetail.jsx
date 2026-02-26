import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Spin, message, Typography, Divider } from 'antd';
import { ArrowLeftOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import leadApi from '../api/leadApi';

const { Title, Text } = Typography;

const LEAD_STATES = [
    { value: 'NEW', label: 'Mới', color: 'blue' },
    { value: 'CONTACTING', label: 'Đang liên hệ', color: 'cyan' },
    { value: 'QUOTED', label: 'Đã báo giá', color: 'orange' },
    { value: 'WON', label: 'Thắng', color: 'green' },
    { value: 'LOST', label: 'Thua', color: 'red' },
];

const getStateInfo = (state) => LEAD_STATES.find((s) => s.value === state) || { label: state || '—', color: 'default' };

export default function LeadDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await leadApi.getDetail(id);
                setData(res.data.data);
            } catch {
                message.error('Không thể tải chi tiết Lead');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
    if (!data) return <div style={{ textAlign: 'center', padding: 80 }}><Text type="secondary">Không tìm thấy Lead</Text></div>;

    const stateInfo = getStateInfo(data.leadState);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}
                style={{ marginBottom: 16, fontSize: 15 }}>
                Quay lại
            </Button>

            <Card
                style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 20, fontWeight: 700,
                        }}>
                            {data.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>{data.fullName}</Title>
                            <Tag color={stateInfo.color} style={{ marginTop: 4 }}>{stateInfo.label}</Tag>
                        </div>
                    </div>
                }
            >
                <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ fontWeight: 600, color: '#666' }} bordered size="small">
                    <Descriptions.Item label="ID">{data.id}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={stateInfo.color}>{stateInfo.label}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={<><MailOutlined /> Email</>}>{data.email || '—'}</Descriptions.Item>
                    <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>{data.phone || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Nguồn">{data.source || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Nhân viên phụ trách (ID)">{data.assignedSalesId || '—'}</Descriptions.Item>
                    <Descriptions.Item label={<><EnvironmentOutlined /> Chi nhánh</>}>{data.locationName || `#${data.locationId}` || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú" span={2}>{data.notes || '—'}</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
}
