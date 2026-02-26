import { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Typography, message, Popconfirm, Tooltip, Upload, Image,
} from 'antd';
import {
    PlusOutlined, EditOutlined, SwapOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, UploadOutlined, DeleteOutlined,
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
    const [fileList, setFileList] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
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
    const handleAdd = () => { 
        setEditing(null); 
        form.resetFields(); 
        setFileList([]);
        setModalOpen(true); 
    };
    const handleEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({ ...record, locationId: record.locationId || record.location?.id });
        // Load existing images
        if (record.images && record.images.length > 0) {
            setFileList(record.images.map((img, idx) => ({
                uid: idx,
                name: `image-${idx}.jpg`,
                status: 'done',
                url: img,
            })));
        } else {
            setFileList([]);
        }
        setModalOpen(true);
    };

    const handleViewDetail = async (id) => {
        try { const res = await hallApi.getDetail(id); setDetailData(res.data.data); setDetailModal(true); }
        catch { message.error('Không thể tải chi tiết'); }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // Add images to payload
            values.images = fileList.map(file => file.url || file.response?.url || file.thumbUrl).filter(Boolean);
            if (editing) { await hallApi.update(editing.id, values); message.success('Cập nhật thành công'); }
            else { await hallApi.create(values); message.success('Tạo mới thành công'); }
            setModalOpen(false);
            setFileList([]);
            fetchData(pagination.current - 1, pagination.pageSize, searchText, filterLocation, filterCapacity);
        } catch (error) { if (error.response?.data?.message) message.error(error.response.data.message); }
    };

    const handleChangeStatus = async (id) => {
        try { await hallApi.changeStatus(id); message.success('Đã thay đổi trạng thái'); fetchData(pagination.current - 1, pagination.pageSize, searchText, filterLocation, filterCapacity); }
        catch { message.error('Thay đổi trạng thái thất bại'); }
    };

    const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList);
    
    const handlePreview = async (file) => {
        setPreviewImage(file.url || file.thumbUrl);
        setPreviewOpen(true);
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ được upload file ảnh!');
            return Upload.LIST_IGNORE;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Ảnh phải nhỏ hơn 5MB!');
            return Upload.LIST_IGNORE;
        }
        // Convert to base64 for preview
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            file.url = reader.result;
            setFileList(prev => [...prev, { ...file, uid: file.uid, status: 'done' }]);
        };
        return false; // Prevent auto upload
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 70, sorter: (a, b) => a.id - b.id },
        { 
            title: 'Ảnh', dataIndex: 'images', width: 80,
            render: (images) => images && images.length > 0 ? (
                <Image src={images[0]} alt="hall" width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
            ) : <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>No img</div>
        },
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
                    <Select.Option value={1000}> 500 khách</Select.Option>
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
                    <Form.Item label="Ảnh hội trường">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            beforeUpload={beforeUpload}
                            onPreview={handlePreview}
                            onChange={handleUploadChange}
                            onRemove={(file) => {
                                setFileList(prev => prev.filter(f => f.uid !== file.uid));
                            }}
                            accept="image/*"
                            multiple
                        >
                            {fileList.length >= 8 ? null : (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                        <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>Tối đa 8 ảnh, mỗi ảnh &lt; 5MB</div>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title="Chi tiết hội trường" open={detailModal} onCancel={() => setDetailModal(false)}
                footer={<Button onClick={() => setDetailModal(false)}>Đóng</Button>} width={680}>
                {detailData && (
                    <div>
                        {detailData.images && detailData.images.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <strong style={{ display: 'block', marginBottom: 12 }}>📷 Gallery ảnh:</strong>
                                <Image.PreviewGroup>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {detailData.images.map((img, idx) => (
                                            <Image key={idx} src={img} alt={`hall-${idx}`} width={120} height={120} style={{ objectFit: 'cover', borderRadius: 8 }} />
                                        ))}
                                    </div>
                                </Image.PreviewGroup>
                            </div>
                        )}
                        <div style={{ lineHeight: 2.2 }}>
                            <p><strong>ID:</strong> {detailData.id}</p>
                            <p><strong>Mã:</strong> {detailData.code}</p>
                            <p><strong>Tên:</strong> {detailData.name}</p>
                            <p><strong>Sức chứa:</strong> {detailData.capacity} khách</p>
                            <p><strong>Chi nhánh:</strong> {detailData.location?.name || '—'}</p>
                            <p><strong>Ghi chú:</strong> {detailData.notes || '—'}</p>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)} width={800}>
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </div>
    );
}
