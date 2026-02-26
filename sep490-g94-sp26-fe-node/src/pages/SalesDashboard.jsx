import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table, Button, Tag, Space, Typography, message, Tabs, Card, Statistic, Row, Col, Tooltip, Input,
} from 'antd';
import {
    EyeOutlined, TeamOutlined, ContactsOutlined, PhoneOutlined, SearchOutlined, ReloadOutlined,
} from '@ant-design/icons';
import leadApi from '../api/leadApi';
import customerApi from '../api/customerApi';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const LEAD_STATES = [
    { value: 'NEW', label: 'Mới', color: 'blue' },
    { value: 'CONTACTING', label: 'Đang liên hệ', color: 'cyan' },
    { value: 'QUOTED', label: 'Đã báo giá', color: 'orange' },
    { value: 'WON', label: 'Thắng', color: 'green' },
    { value: 'LOST', label: 'Thua', color: 'red' },
];

const getStateInfo = (state) => LEAD_STATES.find((s) => s.value === state) || { label: state || '—', color: 'default' };

export default function SalesDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loadingLeads, setLoadingLeads] = useState(false);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [leadPagination, setLeadPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [custPagination, setCustPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [leadSearch, setLeadSearch] = useState('');
    const [custSearch, setCustSearch] = useState('');

    const locationId = user?.locationId;

    const fetchLeads = useCallback(async (page = 0, size = 10, keyword = '') => {
        setLoadingLeads(true);
        try {
            const params = { page, size };
            if (locationId) params.locationId = locationId;
            if (keyword) params.fullName = keyword;
            const res = await leadApi.getAll(params);
            const pageData = res.data.data;
            setLeads(pageData.content || []);
            setLeadPagination({ current: (pageData.number || 0) + 1, pageSize: pageData.size || 10, total: pageData.totalElements || 0 });
        } catch { message.error('Không thể tải danh sách Leads'); }
        finally { setLoadingLeads(false); }
    }, [locationId]);

    const fetchCustomers = useCallback(async (page = 0, size = 10, keyword = '') => {
        setLoadingCustomers(true);
        try {
            const params = { page, size };
            if (locationId) params.locationId = locationId;
            if (keyword) params.fullName = keyword;
            const res = await customerApi.getAll(params);
            const pageData = res.data.data;
            setCustomers(pageData.content || []);
            setCustPagination({ current: (pageData.number || 0) + 1, pageSize: pageData.size || 10, total: pageData.totalElements || 0 });
        } catch { message.error('Không thể tải danh sách khách hàng'); }
        finally { setLoadingCustomers(false); }
    }, [locationId]);

    useEffect(() => { fetchLeads(); fetchCustomers(); }, [fetchLeads, fetchCustomers]);

    const leadColumns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: 'Họ tên', dataIndex: 'fullName', ellipsis: true },
        { title: 'Email', dataIndex: 'email', ellipsis: true },
        { title: 'SĐT', dataIndex: 'phone', width: 130 },
        { title: 'Nguồn', dataIndex: 'source', width: 110 },
        {
            title: 'Trạng thái', dataIndex: 'leadState', width: 130,
            render: (s) => { const info = getStateInfo(s); return <Tag color={info.color}>{info.label}</Tag>; },
        },
        { title: 'Chi nhánh', dataIndex: 'locationName', width: 130, render: (v) => v || '—' },
        {
            title: '', width: 60,
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button type="text" icon={<EyeOutlined />}
                        onClick={() => navigate(`/sales/lead/${record.id}`)}
                        style={{ color: '#4facfe' }} />
                </Tooltip>
            ),
        },
    ];

    const customerColumns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: 'Họ tên', dataIndex: 'fullName', ellipsis: true },
        { title: 'Email', dataIndex: 'email', ellipsis: true },
        { title: 'SĐT', dataIndex: 'phone', width: 130 },
        { title: 'CMND/CCCD', dataIndex: 'citizenIdNumber', width: 140 },
        { title: 'Mã số thuế', dataIndex: 'taxCode', width: 120 },
        { title: 'Chi nhánh', dataIndex: 'locationName', width: 130, render: (v) => v || '—' },
        {
            title: '', width: 60,
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button type="text" icon={<EyeOutlined />}
                        onClick={() => navigate(`/sales/customer/${record.id}`)}
                        style={{ color: '#4facfe' }} />
                </Tooltip>
            ),
        },
    ];

    const tabItems = [
        {
            key: 'leads',
            label: <span><ContactsOutlined style={{ marginRight: 8 }} />Leads ({leadPagination.total})</span>,
            children: (
                <>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <Input placeholder="Tìm theo tên..." value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)}
                            onPressEnter={() => fetchLeads(0, leadPagination.pageSize, leadSearch)}
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} style={{ maxWidth: 300, borderRadius: 8 }} allowClear />
                        <Button icon={<SearchOutlined />} onClick={() => fetchLeads(0, leadPagination.pageSize, leadSearch)} style={{ borderRadius: 8 }}>Tìm</Button>
                        <Button icon={<ReloadOutlined />} onClick={() => { setLeadSearch(''); fetchLeads(); }} style={{ borderRadius: 8 }}>Làm mới</Button>
                    </div>
                    <Table columns={leadColumns} dataSource={leads} rowKey="id" loading={loadingLeads} size="middle"
                        pagination={{ ...leadPagination, showSizeChanger: true, showTotal: (total) => `Tổng ${total} leads` }}
                        onChange={(pag) => fetchLeads(pag.current - 1, pag.pageSize, leadSearch)} scroll={{ x: 800 }}
                        onRow={(record) => ({ onClick: () => navigate(`/sales/lead/${record.id}`), style: { cursor: 'pointer' } })} />
                </>
            ),
        },
        {
            key: 'customers',
            label: <span><TeamOutlined style={{ marginRight: 8 }} />Khách hàng ({custPagination.total})</span>,
            children: (
                <>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <Input placeholder="Tìm theo tên..." value={custSearch} onChange={(e) => setCustSearch(e.target.value)}
                            onPressEnter={() => fetchCustomers(0, custPagination.pageSize, custSearch)}
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} style={{ maxWidth: 300, borderRadius: 8 }} allowClear />
                        <Button icon={<SearchOutlined />} onClick={() => fetchCustomers(0, custPagination.pageSize, custSearch)} style={{ borderRadius: 8 }}>Tìm</Button>
                        <Button icon={<ReloadOutlined />} onClick={() => { setCustSearch(''); fetchCustomers(); }} style={{ borderRadius: 8 }}>Làm mới</Button>
                    </div>
                    <Table columns={customerColumns} dataSource={customers} rowKey="id" loading={loadingCustomers} size="middle"
                        pagination={{ ...custPagination, showSizeChanger: true, showTotal: (total) => `Tổng ${total} khách hàng` }}
                        onChange={(pag) => fetchCustomers(pag.current - 1, pag.pageSize, custSearch)} scroll={{ x: 800 }}
                        onRow={(record) => ({ onClick: () => navigate(`/sales/customer/${record.id}`), style: { cursor: 'pointer' } })} />
                </>
            ),
        },
    ];

    return (
        <div>
            <Title level={3} style={{ margin: '0 0 20px' }}>💼 Khu vực Sales</Title>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #667eea22, #764ba222)' }}>
                        <Statistic title="Tổng Leads" value={leadPagination.total} prefix={<ContactsOutlined />}
                            valueStyle={{ color: '#667eea', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #4facfe22, #00f2fe22)' }}>
                        <Statistic title="Tổng Khách hàng" value={custPagination.total} prefix={<TeamOutlined />}
                            valueStyle={{ color: '#4facfe', fontWeight: 700 }} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #43e97b22, #38f9d722)' }}>
                        <Statistic title="Chi nhánh" value={locationId ? `#${locationId}` : 'Tất cả'} prefix={<PhoneOutlined />}
                            valueStyle={{ color: '#43e97b', fontWeight: 700 }} />
                    </Card>
                </Col>
            </Row>

            <Tabs items={tabItems} defaultActiveKey="leads" type="card" />
        </div>
    );
}
