import { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Modal, Form, Input, Tag, Space, Typography, message, Popconfirm, Tooltip,
} from 'antd';
import {
    PlusOutlined, EditOutlined, SwapOutlined, SearchOutlined, ReloadOutlined, EyeOutlined,
} from '@ant-design/icons';
import locationApi from '../api/locationApi';

const { Title } = Typography;
const { TextArea } = Input;

export default function Locations() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [modalOpen, setModalOpen] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const fetchData = useCallback(async (page = 0, size = 10, keyword = '') => {
        setLoading(true);
        try {
            const params = { page, size };
            if (keyword) params.keyword = keyword;
            const res = await locationApi.getAll(params);
            const pageData = res.data.data;
            setData(pageData.content || []);
            setPagination({ current: (pageData.number || 0) + 1, pageSize: pageData.size || 10, total: pageData.totalElements || 0 });
        } catch { message.error('Không thể tải danh sách địa điểm'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleTableChange = (pag) => fetchData(pag.current - 1, pag.pageSize, searchText);
    const handleSearch = () => fetchData(0, pagination.pageSize, searchText);

    const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
    const handleEdit = (record) => { setEditing(record); form.setFieldsValue(record); setModalOpen(true); };

    const handleViewDetail = async (id) => {
        try { const res = await locationApi.getDetail(id); setDetailData(res.data.data); setDetailModal(true); }
        catch { message.error('Không thể tải chi tiết'); }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editing) { await locationApi.update(editing.id, values); message.success('Cập nhật thành công'); }
            else { await locationApi.create(values); message.success('Tạo mới thành công'); }
            setModalOpen(false);
            fetchData(pagination.current - 1, pagination.pageSize, searchText);
        } catch (error) { if (error.response?.data?.message) message.error(error.response.data.message); }
    };

    const handleChangeStatus = async (id) => {
        try { await locationApi.changeStatus(id); message.success('Đã thay đổi trạng thái'); fetchData(pagination.current - 1, pagination.pageSize, searchText); }
        catch { message.error('Thay đổi trạng thái thất bại'); }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 70, sorter: (a, b) => a.id - b.id },
        { title: 'Mã', dataIndex: 'code', width: 120 },
        { title: 'Tên địa điểm', dataIndex: 'name', ellipsis: true },
        { title: 'Địa chỉ', dataIndex: 'address', ellipsis: true },
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
                <Title level={3} style={{ margin: 0 }}>📍 Quản lý Địa điểm</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}
                    style={{ background: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', border: 'none', borderRadius: 8, height: 40 }}>
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
                onChange={handleTableChange} scroll={{ x: 700 }} />

            <Modal title={editing ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm mới'} open={modalOpen} onOk={handleSubmit}
                onCancel={() => setModalOpen(false)} okText={editing ? 'Cập nhật' : 'Tạo mới'} cancelText="Hủy" width={520}>
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="code" label="Mã địa điểm"><Input placeholder="VD: HN01" /></Form.Item>
                    <Form.Item name="name" label="Tên địa điểm"><Input placeholder="Nhập tên" /></Form.Item>
                    <Form.Item name="address" label="Địa chỉ"><Input placeholder="Nhập địa chỉ" /></Form.Item>
                    <Form.Item name="notes" label="Ghi chú"><TextArea rows={3} placeholder="Nhập ghi chú" /></Form.Item>
                </Form>
            </Modal>

            <Modal title="Chi tiết địa điểm" open={detailModal} onCancel={() => setDetailModal(false)}
                footer={<Button onClick={() => setDetailModal(false)}>Đóng</Button>} width={520}>
                {detailData && (
                    <div style={{ lineHeight: 2.2 }}>
                        <p><strong>ID:</strong> {detailData.id}</p>
                        <p><strong>Mã:</strong> {detailData.code}</p>
                        <p><strong>Tên:</strong> {detailData.name}</p>
                        <p><strong>Địa chỉ:</strong> {detailData.address || '—'}</p>
                        <p><strong>Ghi chú:</strong> {detailData.notes || '—'}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
