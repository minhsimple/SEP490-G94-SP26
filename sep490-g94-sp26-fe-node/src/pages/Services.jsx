import { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Typography, message, Popconfirm, Tooltip,
} from 'antd';
import {
    PlusOutlined, EditOutlined, SwapOutlined, SearchOutlined, ReloadOutlined, EyeOutlined,
} from '@ant-design/icons';
import serviceApi from '../api/serviceApi';
import locationApi from '../api/locationApi';

const { Title } = Typography;
const { TextArea } = Input;

export default function Services() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [modalOpen, setModalOpen] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [locations, setLocations] = useState([]);
    const [form] = Form.useForm();

    const fetchLocations = async () => {
        try { const res = await locationApi.getAll({ size: 100 }); setLocations(res.data.data?.content || []); }
        catch { /* ignore */ }
    };

    const fetchData = useCallback(async (page = 0, size = 10, keyword = '') => {
        setLoading(true);
        try {
            const params = { page, size };
            if (keyword) params.keyword = keyword;
            const res = await serviceApi.getAll(params);
            const pageData = res.data.data;
            setData(pageData.content || []);
            setPagination({ current: (pageData.number || 0) + 1, pageSize: pageData.size || 10, total: pageData.totalElements || 0 });
        } catch { message.error('Không thể tải danh sách dịch vụ'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); fetchLocations(); }, [fetchData]);

    const handleTableChange = (pag) => fetchData(pag.current - 1, pag.pageSize, searchText);
    const handleSearch = () => fetchData(0, pagination.pageSize, searchText);
    const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
    const handleEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({ ...record, locationId: record.locationId || record.location?.id });
        setModalOpen(true);
    };

    const handleViewDetail = async (id) => {
        try { const res = await serviceApi.getDetail(id); setDetailData(res.data.data); setDetailModal(true); }
        catch { message.error('Không thể tải chi tiết'); }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editing) { await serviceApi.update(editing.id, values); message.success('Cập nhật thành công'); }
            else { await serviceApi.create(values); message.success('Tạo mới thành công'); }
            setModalOpen(false);
            fetchData(pagination.current - 1, pagination.pageSize, searchText);
        } catch (error) { if (error.response?.data?.message) message.error(error.response.data.message); }
    };

    const handleChangeStatus = async (id) => {
        try { await serviceApi.changeStatus(id); message.success('Đã thay đổi trạng thái'); fetchData(pagination.current - 1, pagination.pageSize, searchText); }
        catch { message.error('Thay đổi trạng thái thất bại'); }
    };

    const formatPrice = (price) => {
        if (!price) return '—';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 70, sorter: (a, b) => a.id - b.id },
        { title: 'Mã', dataIndex: 'code', width: 120 },
        { title: 'Tên dịch vụ', dataIndex: 'name', ellipsis: true },
        { title: 'Đơn vị', dataIndex: 'unit', width: 100 },
        { title: 'Giá cơ bản', dataIndex: 'basePrice', width: 140, render: (v) => formatPrice(v) },
        { title: 'Chi nhánh', dataIndex: 'locationId', ellipsis: true, render: (locId) => { const loc = locations.find((l) => l.id === locId); return loc?.name || '—'; } },
        {
            title: 'Hành động', width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết"><Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)} style={{ color: '#4facfe' }} /></Tooltip>
                    <Tooltip title="Chỉnh sửa"><Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: '#667eea' }} /></Tooltip>
                    <Popconfirm title="Thay đổi trạng thái?" onConfirm={() => handleChangeStatus(record.id)}>
                        <Tooltip title="Bật/Tắt"><Button type="text" icon={<SwapOutlined />} style={{ color: '#f5576c' }} /></Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>🎁 Quản lý Dịch vụ</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}
                    style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)', border: 'none', borderRadius: 8, height: 40, color: '#333' }}>
                    Thêm mới
                </Button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <Input placeholder="Tìm kiếm..." value={searchText} onChange={(e) => setSearchText(e.target.value)} onPressEnter={handleSearch}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} style={{ maxWidth: 360, borderRadius: 8 }} allowClear />
                <Button icon={<SearchOutlined />} onClick={handleSearch} style={{ borderRadius: 8 }}>Tìm</Button>
                <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); fetchData(); }} style={{ borderRadius: 8 }}>Làm mới</Button>
            </div>

            <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
                pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `Tổng ${total} bản ghi` }}
                onChange={handleTableChange} scroll={{ x: 900 }} />

            <Modal title={editing ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'} open={modalOpen} onOk={handleSubmit}
                onCancel={() => setModalOpen(false)} okText={editing ? 'Cập nhật' : 'Tạo mới'} cancelText="Hủy" width={520}>
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="code" label="Mã dịch vụ" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
                        <Input placeholder="VD: SVC-01" />
                    </Form.Item>
                    <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="Nhập tên dịch vụ" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={3} placeholder="Nhập mô tả dịch vụ" />
                    </Form.Item>
                    <Form.Item name="unit" label="Đơn vị">
                        <Input placeholder="VD: bàn, set, gói..." />
                    </Form.Item>
                    <Form.Item name="basePrice" label="Giá cơ bản (VND)">
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="VD: 5000000"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/,/g, '')} />
                    </Form.Item>
                    <Form.Item name="locationId" label="Chi nhánh">
                        <Select placeholder="Chọn chi nhánh" allowClear>
                            {locations.map((loc) => (<Select.Option key={loc.id} value={loc.id}>{loc.name}</Select.Option>))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title="Chi tiết dịch vụ" open={detailModal} onCancel={() => setDetailModal(false)}
                footer={<Button onClick={() => setDetailModal(false)}>Đóng</Button>} width={520}>
                {detailData && (
                    <div style={{ lineHeight: 2.2 }}>
                        <p><strong>ID:</strong> {detailData.id}</p>
                        <p><strong>Mã:</strong> {detailData.code}</p>
                        <p><strong>Tên:</strong> {detailData.name}</p>
                        <p><strong>Mô tả:</strong> {detailData.description || '—'}</p>
                        <p><strong>Đơn vị:</strong> {detailData.unit || '—'}</p>
                        <p><strong>Giá cơ bản:</strong> {formatPrice(detailData.basePrice)}</p>
                        <p><strong>Chi nhánh:</strong> {detailData.location?.name || '—'}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
