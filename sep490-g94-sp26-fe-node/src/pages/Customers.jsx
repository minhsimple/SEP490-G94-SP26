import { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Tag,
    Space,
    Typography,
    message,
    Popconfirm,
    Tooltip,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    SwapOutlined,
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import customerApi from '../api/customerApi';
import locationApi from '../api/locationApi';

const { Title } = Typography;
const { TextArea } = Input;

export default function Customers() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [modalOpen, setModalOpen] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [locations, setLocations] = useState([]);
    const [form] = Form.useForm();

    const fetchLocations = async () => {
        try {
            const res = await locationApi.getAll({ size: 100 });
            setLocations(res.data.data?.content || []);
        } catch {
            // ignore
        }
    };

    const fetchData = useCallback(async (page = 0, size = 10, keyword = '') => {
        setLoading(true);
        try {
            const params = { page, size };
            if (keyword) params.keyword = keyword;

            const res = await customerApi.getAll(params);
            const pageData = res.data.data;
            setData(pageData.content || []);
            setPagination({
                current: (pageData.number || 0) + 1,
                pageSize: pageData.size || 10,
                total: pageData.totalElements || 0,
            });
        } catch {
            message.error('Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchLocations();
    }, [fetchData]);

    const handleTableChange = (pag) => {
        fetchData(pag.current - 1, pag.pageSize, searchText);
    };

    const handleSearch = () => {
        fetchData(0, pagination.pageSize, searchText);
    };

    const handleAdd = () => {
        setEditingCustomer(null);
        form.resetFields();
        setModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingCustomer(record);
        form.setFieldsValue({
            ...record,
            locationId: record.locationId || record.location?.id,
        });
        setModalOpen(true);
    };

    const handleViewDetail = async (id) => {
        try {
            const res = await customerApi.getDetail(id);
            setDetailData(res.data.data);
            setDetailModal(true);
        } catch {
            message.error('Không thể tải chi tiết');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingCustomer) {
                await customerApi.update(editingCustomer.id, values);
                message.success('Cập nhật khách hàng thành công');
            } else {
                await customerApi.create(values);
                message.success('Tạo khách hàng mới thành công');
            }
            setModalOpen(false);
            fetchData(pagination.current - 1, pagination.pageSize, searchText);
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            }
        }
    };

    const handleChangeStatus = async (id) => {
        try {
            await customerApi.changeStatus(id);
            message.success('Đã thay đổi trạng thái');
            fetchData(pagination.current - 1, pagination.pageSize, searchText);
        } catch {
            message.error('Thay đổi trạng thái thất bại');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            ellipsis: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            ellipsis: true,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            width: 140,
        },
        {
            title: 'CMND/CCCD',
            dataIndex: 'citizenIdNumber',
            width: 140,
        },
        {
            title: 'Hành động',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)} style={{ color: '#4facfe' }} />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: '#667eea' }} />
                    </Tooltip>
                    <Popconfirm title="Thay đổi trạng thái?" onConfirm={() => handleChangeStatus(record.id)}>
                        <Tooltip title="Bật/Tắt">
                            <Button type="text" icon={<SwapOutlined />} style={{ color: '#f5576c' }} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>
                    🤝 Quản lý Khách hàng
                </Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}
                    style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)', border: 'none', borderRadius: 8, height: 40 }}>
                    Thêm mới
                </Button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <Input
                    placeholder="Tìm kiếm theo tên, email, SĐT..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    style={{ maxWidth: 360, borderRadius: 8 }}
                    allowClear
                />
                <Button icon={<SearchOutlined />} onClick={handleSearch} style={{ borderRadius: 8 }}>Tìm</Button>
                <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); fetchData(); }} style={{ borderRadius: 8 }}>Làm mới</Button>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} bản ghi`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 800 }}
            />

            {/* Create / Edit Modal */}
            <Modal
                title={editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                okText={editingCustomer ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                width={560}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                        <Input placeholder="Nhập họ tên" />
                    </Form.Item>
                    <Form.Item name="citizenIdNumber" label="Số CMND/CCCD" rules={[{ required: true, message: 'Vui lòng nhập CMND/CCCD' }]}>
                        <Input placeholder="Nhập số CMND/CCCD" />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                        <Input placeholder="VD: 0912345678" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[
                        { type: 'email', message: 'Email không hợp lệ' },
                    ]}>
                        <Input placeholder="Nhập email" />
                    </Form.Item>
                    <Form.Item name="taxCode" label="Mã số thuế" rules={[{ required: true, message: 'Vui lòng nhập mã số thuế' }]}>
                        <Input placeholder="Nhập mã số thuế" />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                        <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>
                    <Form.Item name="locationId" label="Chi nhánh" rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}>
                        <Select placeholder="Chọn chi nhánh">
                            {locations.map((loc) => (
                                <Select.Option key={loc.id} value={loc.id}>{loc.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="notes" label="Ghi chú">
                        <TextArea rows={3} placeholder="Nhập ghi chú" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết khách hàng"
                open={detailModal}
                onCancel={() => setDetailModal(false)}
                footer={<Button onClick={() => setDetailModal(false)}>Đóng</Button>}
                width={520}
            >
                {detailData && (
                    <div style={{ lineHeight: 2.2 }}>
                        <p><strong>ID:</strong> {detailData.id}</p>
                        <p><strong>Họ tên:</strong> {detailData.fullName}</p>
                        <p><strong>CMND/CCCD:</strong> {detailData.citizenIdNumber}</p>
                        <p><strong>Email:</strong> {detailData.email}</p>
                        <p><strong>Số điện thoại:</strong> {detailData.phone}</p>
                        <p><strong>Mã số thuế:</strong> {detailData.taxCode}</p>
                        <p><strong>Địa chỉ:</strong> {detailData.address || '—'}</p>
                        <p><strong>Ghi chú:</strong> {detailData.notes || '—'}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
