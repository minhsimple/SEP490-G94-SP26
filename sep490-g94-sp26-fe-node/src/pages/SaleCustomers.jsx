import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table, Button, Tag, Space, Typography, message, Input, Tooltip, Card, Row, Col, Statistic,
} from 'antd';
import {
    EyeOutlined, SearchOutlined, ReloadOutlined, TeamOutlined,
} from '@ant-design/icons';
import customerApi from '../api/customerApi';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

export default function SaleCustomers() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');

    const locationId = user?.locationId;

    const fetchData = useCallback(async (page = 0, size = 10, keyword = '') => {
        setLoading(true);
        try {
            const params = { page, size };
            if (locationId) params.locationId = locationId;
            if (keyword) params.fullName = keyword;
            const res = await customerApi.getAll(params);
            const pageData = res.data.data;
            setData(pageData.content || []);
            setPagination({ current: (pageData.number || 0) + 1, pageSize: pageData.size || 10, total: pageData.totalElements || 0 });
        } catch { message.error('Không thể tải danh sách khách hàng'); }
        finally { setLoading(false); }
    }, [locationId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = () => fetchData(0, pagination.pageSize, searchText);

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60, sorter: (a, b) => a.id - b.id },
        { title: 'Họ tên', dataIndex: 'fullName', ellipsis: true },
        { title: 'Email', dataIndex: 'email', ellipsis: true },
        { title: 'SĐT', dataIndex: 'phone', width: 130 },
        { title: 'CMND/CCCD', dataIndex: 'citizenIdNumber', width: 140 },
        { title: 'Mã số thuế', dataIndex: 'taxCode', width: 120 },
        { title: 'Chi nhánh', dataIndex: 'locationName', width: 130, render: (v) => v || '—' },
        {
            title: 'Hành động', width: 80, align: 'center',
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button type="text" icon={<EyeOutlined />}
                        onClick={(e) => { e.stopPropagation(); navigate(`/sales/customer/${record.id}`); }}
                        style={{ color: '#4facfe' }} />
                </Tooltip>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>🤝 Khách hàng</Title>
            </div>

            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #4facfe18, #00f2fe18)' }}>
                        <Statistic title="Tổng Khách hàng" value={pagination.total} prefix={<TeamOutlined />}
                            valueStyle={{ color: '#4facfe', fontWeight: 700 }} />
                    </Card>
                </Col>
            </Row>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <Input placeholder="Tìm theo tên..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} style={{ maxWidth: 360, borderRadius: 8 }} allowClear />
                <Button icon={<SearchOutlined />} onClick={handleSearch} style={{ borderRadius: 8 }}>Tìm</Button>
                <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); fetchData(); }} style={{ borderRadius: 8 }}>Làm mới</Button>
            </div>

            <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
                pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `Tổng ${total} khách hàng` }}
                onChange={(pag) => fetchData(pag.current - 1, pag.pageSize, searchText)} scroll={{ x: 800 }}
                onRow={(record) => ({ onClick: () => navigate(`/sales/customer/${record.id}`), style: { cursor: 'pointer' } })} />
        </div>
    );
}
