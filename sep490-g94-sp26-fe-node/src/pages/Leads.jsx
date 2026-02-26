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
    UserSwitchOutlined,
} from '@ant-design/icons';
import leadApi from '../api/leadApi';
import locationApi from '../api/locationApi';

const { Title } = Typography;
const { TextArea } = Input;

const LEAD_STATES = [
    { value: 'NEW', label: 'Mới', color: 'blue' },
    { value: 'CONTACTING', label: 'Đang liên hệ', color: 'cyan' },
    { value: 'QUOTED', label: 'Đã báo giá', color: 'orange' },
    { value: 'WON', label: 'Thắng', color: 'green' },
    { value: 'LOST', label: 'Thua', color: 'red' },
];

export default function Leads() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [modalOpen, setModalOpen] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [assignModal, setAssignModal] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [locations, setLocations] = useState([]);
    const [form] = Form.useForm();
    const [assignForm] = Form.useForm();

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

            const res = await leadApi.getAll(params);
            const pageData = res.data.data;
            setData(pageData.content || []);
            setPagination({
                current: (pageData.number || 0) + 1,
                pageSize: pageData.size || 10,
                total: pageData.totalElements || 0,
            });
        } catch {
            message.error('Không thể tải danh sách khách hàng tiềm năng');
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
        setEditingLead(null);
        form.resetFields();
        setModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingLead(record);
        form.setFieldsValue({
            ...record,
            state: record.leadState || record.state,
            locationId: record.locationId,
        });
        setModalOpen(true);
    };

    const handleViewDetail = async (id) => {
        try {
            const res = await leadApi.getDetail(id);
            setDetailData(res.data.data);
            setDetailModal(true);
        } catch {
            message.error('Không thể tải chi tiết');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingLead) {
                await leadApi.update(editingLead.id, values);
                message.success('Cập nhật thành công');
            } else {
                await leadApi.create(values);
                message.success('Tạo mới thành công');
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
            await leadApi.changeStatus(id);
            message.success('Đã thay đổi trạng thái');
            fetchData(pagination.current - 1, pagination.pageSize, searchText);
        } catch {
            message.error('Thay đổi trạng thái thất bại');
        }
    };

    const handleAssign = (leadId) => {
        setSelectedLeadId(leadId);
        assignForm.resetFields();
        setAssignModal(true);
    };

    const handleAssignSubmit = async () => {
        try {
            const values = await assignForm.validateFields();
            await leadApi.assignToSales(selectedLeadId, values);
            message.success('Đã gán cho nhân viên Sales');
            setAssignModal(false);
            fetchData(pagination.current - 1, pagination.pageSize, searchText);
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            }
        }
    };

    const getStateInfo = (state) => LEAD_STATES.find((s) => s.value === state) || { label: state, color: 'default' };

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
            title: 'Nguồn',
            dataIndex: 'source',
            width: 120,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'leadState',
            width: 130,
            render: (leadState) => {
                const info = getStateInfo(leadState);
                return <Tag color={info.color}>{info.label}</Tag>;
            },
        },
        {
            title: 'Hành động',
            width: 180,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)} style={{ color: '#4facfe' }} />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ color: '#667eea' }} />
                    </Tooltip>
                    <Tooltip title="Gán cho Sales">
                        <Button type="text" icon={<UserSwitchOutlined />} onClick={() => handleAssign(record.id)} style={{ color: '#43e97b' }} />
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
                    📋 Khách hàng tiềm năng (Leads)
                </Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}
                    style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)', border: 'none', borderRadius: 8, height: 40 }}>
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
                scroll={{ x: 900 }}
            />

            {/* Create / Edit Modal */}
            <Modal
                title={editingLead ? 'Chỉnh sửa Lead' : 'Thêm Lead mới'}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                okText={editingLead ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                width={520}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                        <Input placeholder="Nhập họ tên" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' },
                    ]}>
                        <Input placeholder="Nhập email" />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                        <Input placeholder="VD: 0912345678" />
                    </Form.Item>
                    <Form.Item name="source" label="Nguồn">
                        <Input placeholder="VD: Facebook, Website, Giới thiệu..." />
                    </Form.Item>
                    <Form.Item name="state" label="Trạng thái">
                        <Select placeholder="Chọn trạng thái">
                            {LEAD_STATES.map((s) => (
                                <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="locationId" label="Chi nhánh">
                        <Select placeholder="Chọn chi nhánh" allowClear>
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
                title="Chi tiết Lead"
                open={detailModal}
                onCancel={() => setDetailModal(false)}
                footer={<Button onClick={() => setDetailModal(false)}>Đóng</Button>}
                width={520}
            >
                {detailData && (
                    <div style={{ lineHeight: 2.2 }}>
                        <p><strong>ID:</strong> {detailData.id}</p>
                        <p><strong>Họ tên:</strong> {detailData.fullName}</p>
                        <p><strong>Email:</strong> {detailData.email}</p>
                        <p><strong>Số điện thoại:</strong> {detailData.phone}</p>
                        <p><strong>Nguồn:</strong> {detailData.source || '—'}</p>
                        <p><strong>Trạng thái:</strong> <Tag color={getStateInfo(detailData.leadState).color}>{getStateInfo(detailData.leadState).label}</Tag></p>
                        <p><strong>Ghi chú:</strong> {detailData.notes || '—'}</p>
                    </div>
                )}
            </Modal>

            {/* Assign to Sales Modal */}
            <Modal
                title="Gán cho nhân viên Sales"
                open={assignModal}
                onOk={handleAssignSubmit}
                onCancel={() => setAssignModal(false)}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Form form={assignForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="note" label="Ghi chú">
                        <TextArea rows={3} placeholder="Nhập ghi chú khi gán" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
