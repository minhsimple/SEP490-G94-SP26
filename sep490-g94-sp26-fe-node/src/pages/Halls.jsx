import { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Typography, message, Popconfirm, Tooltip,
} from 'antd';
import {
    PlusOutlined, EditOutlined, SwapOutlined, SearchOutlined, ReloadOutlined, EyeOutlined,
} from '@ant-design/icons';
import hallApi from '../api/hallApi';
import locationApi from '../api/locationApi';

const { Title } = Typography;
const { TextArea } = Input;

export default function Halls() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [modalOpen, setModalOpen] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [locations, setLocations] = useState([]);
    const [filterLocation, setFilterLocation] = useState(null);
    const [filterCapacity, setFilterCapacity] = useState(null);
    const [form] = Form.useForm();

    const fetchLocations = async () => {
        try { const res = await locationApi.getAll({ size: 100 }); setLocations(res.data.data?.content || []); }
        catch { /* ignore */ }
    };

    const fetchData = useCallback(async (page = 0, size = 10, keyword = '', locId = null, capacity = null) => {
        setLoading(true);
        try {
            const params = { page, size };
            if (keyword) params.keyword = keyword;
            if (locId) params.locationId = locId;
            if (capacity) params.capacity = capacity;
            const res = await hallApi.getAll(params);
            const pageData = res.data.data;
            setData(pageData.content || []);
            setPagination({ current: (pageData.number || 0) + 1, pageSize: pageData.size || 10, total: pageData.totalElements || 0 });
        } catch { message.error('Không thể tải danh sách hội trường'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); fetchLocations(); }, [fetchData]);

    const handleTableChange = (pag) => fetchData(pag.current - 1, pag.pageSize, searchText, filterLocation, filterCapacity);
    const handleSearch = () => fetchData(0, pagination.pageSize, searchText, filterLocation, filterCapacity);
    const handleReset = () => {
        setSearchText('');
        setFilterLocation(null);
        setFilterCapacity(null);
        fetchData(0, pagination.pageSize, '', null, null);
    };
    const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
    const handleEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({ ...record, locationId: record.locationId || record.location?.id });
        setModalOpen(true);
    };

    const handleViewDetail = async (id) => {
        try { const res = await hallApi.getDetail(id); setDetailData(res.data.data); setDetailModal(true); }
        catch { message.error('Không thể tải chi tiết'); }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editing) { await hallApi.update(editing.id, values); message.success('Cập nhật thành công'); }
            else { await hallApi.create(values); message.success('Tạo mới thành công'); }
            setModalOpen(false);
            fetchData(pagination.current - 1, pagination.pageSize, searchText, filterLocation, filterCapacity);
        } catch (error) { if (error.response?.data?.message) message.error(error.response.data.message); }
    };

    const handleChangeStatus = async (id) => {
        try { await hallApi.changeStatus(id); message.success('Đã thay đổi trạng thái'); fetchData(pagination.current - 1, pagination.pageSize, searchText, filterLocation, filterCapacity); }
        catch { message.error('Thay đổi trạng thái thất bại'); }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 70, sorter: (a, b) => a.id - b.id },
        { title: 'Mã', dataIndex: 'code', width: 120 },
        { title: 'Tên hội trường', dataIndex: 'name', ellipsis: true },
        { title: 'Sức chứa', dataIndex: 'capacity', width: 100, render: (v) => v ? `${v} khách` : '—' },
        { title: 'Chi nhánh', dataIndex: ['location', 'name'], ellipsis: true, render: (v) => v || '—' },
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
                <Title level={3} style={{ margin: 0 }}>🏛️ Quản lý Hội trường</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}
                    style={{ background: 'linear-gradient(135deg, #fa709a, #fee140)', border: 'none', borderRadius: 8, height: 40, color: '#333' }}>
                    Thêm mới
                </Button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <Input placeholder="Tìm kiếm..." value={searchText} onChange={(e) => setSearchText(e.target.value)} onPressEnter={handleSearch}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} style={{ maxWidth: 300, borderRadius: 8 }} allowClear />
                <Select placeholder="Lọc theo chi nhánh" value={filterLocation} onChange={setFilterLocation} 
                    style={{ minWidth: 200, borderRadius: 8 }} allowClear>
                    {locations.map((loc) => (<Select.Option key={loc.id} value={loc.id}>{loc.name}</Select.Option>))}
                </Select>
                <Select placeholder="Lọc theo sức chứa" value={filterCapacity} onChange={setFilterCapacity}
                    style={{ minWidth: 180, borderRadius: 8 }} allowClear>
                    <Select.Option value={50}>≤ 50 khách</Select.Option>
                    <Select.Option value={100}>≤ 100 khách</Select.Option>
                    <Select.Option value={200}>≤ 200 khách</Select.Option>
                    <Select.Option value={500}>≤ 500 khách</Select.Option>
                    <Select.Option value={1000}>> 500 khách</Select.Option>
                </Select>
                <Button icon={<SearchOutlined />} onClick={handleSearch} style={{ borderRadius: 8 }}>Tìm</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset} style={{ borderRadius: 8 }}>Làm mới</Button>
            </div>

            <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
                pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `Tổng ${total} bản ghi` }}
                onChange={handleTableChange} scroll={{ x: 800 }} />

            <Modal title={editing ? 'Chỉnh sửa hội trường' : 'Thêm hội trường mới'} open={modalOpen} onOk={handleSubmit}
                onCancel={() => setModalOpen(false)} okText={editing ? 'Cập nhật' : 'Tạo mới'} cancelText="Hủy" width={520}>
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="code" label="Mã hội trường" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
                        <Input placeholder="VD: HALL-01" />
                    </Form.Item>
                    <Form.Item name="name" label="Tên hội trường" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="Nhập tên hội trường" />
                    </Form.Item>
                    <Form.Item name="locationId" label="Chi nhánh" rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}>
                        <Select placeholder="Chọn chi nhánh">
                            {locations.map((loc) => (<Select.Option key={loc.id} value={loc.id}>{loc.name}</Select.Option>))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="capacity" label="Sức chứa (khách)" rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}>
                        <InputNumber min={1} placeholder="VD: 200" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="notes" label="Ghi chú"><TextArea rows={3} placeholder="Nhập ghi chú" /></Form.Item>
                </Form>
            </Modal>

            <Modal title="Chi tiết hội trường" open={detailModal} onCancel={() => setDetailModal(false)}
                footer={<Button onClick={() => setDetailModal(false)}>Đóng</Button>} width={520}>
                {detailData && (
                    <div style={{ lineHeight: 2.2 }}>
                        <p><strong>ID:</strong> {detailData.id}</p>
                        <p><strong>Mã:</strong> {detailData.code}</p>
                        <p><strong>Tên:</strong> {detailData.name}</p>
                        <p><strong>Sức chứa:</strong> {detailData.capacity} khách</p>
                        <p><strong>Chi nhánh:</strong> {detailData.location?.name || '—'}</p>
                        <p><strong>Ghi chú:</strong> {detailData.notes || '—'}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
