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
} from '@ant-design/icons';
import userApi from '../api/userApi';
import roleApi from '../api/roleApi';
import locationApi from '../api/locationApi';

const { Title } = Typography;

export default function Users() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [roles, setRoles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [form] = Form.useForm();

    const fetchRoles = async () => {
        try {
            const res = await roleApi.getAll({ size: 100 });
            setRoles(res.data.data?.content || []);
        } catch {
            // ignore
        }
    };

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

            const res = await userApi.getAll(params);
            const pageData = res.data.data;
            setData(pageData.content || []);
            setPagination({
                current: (pageData.number || 0) + 1,
                pageSize: pageData.size || 10,
                total: pageData.totalElements || 0,
            });
        } catch (error) {
            message.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchRoles();
        fetchLocations();
    }, [fetchData]);

    const handleTableChange = (pag) => {
        fetchData(pag.current - 1, pag.pageSize, searchText);
    };

    const handleSearch = () => {
        fetchData(0, pagination.pageSize, searchText);
    };

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingUser(record);
        form.setFieldsValue({
            ...record,
            roleId: record.roleId || record.role?.id,
            locationId: record.locationId || record.location?.id,
        });
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser) {
                await userApi.update(editingUser.id, values);
                message.success('Cập nhật người dùng thành công');
            } else {
                await userApi.create(values);
                message.success('Tạo người dùng thành công');
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
            await userApi.changeStatus(id);
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
            title: 'Vai trò',
            dataIndex: 'roleId',
            width: 130,
            render: (roleId) => {
                const role = roles.find((r) => r.id === roleId);
                return <Tag color='blue'>{role?.name || roleId || '—'}</Tag>;
            },
        },
        {
            title: 'Hành động',
            width: 140,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            style={{ color: '#667eea' }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn có chắc muốn thay đổi trạng thái?"
                        onConfirm={() => handleChangeStatus(record.id)}
                    >
                        <Tooltip title="Bật/Tắt trạng thái">
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
                    👤 Quản lý Người dùng
                </Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}
                    style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 8, height: 40 }}>
                    Thêm mới
                </Button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <Input
                    placeholder="Tìm kiếm theo tên, email..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    style={{ maxWidth: 360, borderRadius: 8 }}
                    allowClear
                />
                <Button icon={<SearchOutlined />} onClick={handleSearch} style={{ borderRadius: 8 }}>
                    Tìm
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); fetchData(); }} style={{ borderRadius: 8 }}>
                    Làm mới
                </Button>
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
                style={{ borderRadius: 12, overflow: 'hidden' }}
            />

            <Modal
                title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                okText={editingUser ? 'Cập nhật' : 'Tạo mới'}
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
                        <Input placeholder="Nhập email" disabled={!!editingUser} />
                    </Form.Item>
                    {!editingUser && (
                        <Form.Item name="password" label="Mật khẩu">
                            <Input.Password placeholder="Nhập mật khẩu" />
                        </Form.Item>
                    )}
                    <Form.Item name="phone" label="Số điện thoại">
                        <Input placeholder="VD: 0912345678" />
                    </Form.Item>
                    <Form.Item name="roleId" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
                        <Select placeholder="Chọn vai trò">
                            {roles.map((role) => (
                                <Select.Option key={role.id} value={role.id}>{role.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="locationId" label="Chi nhánh" rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}>
                        <Select placeholder="Chọn chi nhánh">
                            {locations.map((loc) => (
                                <Select.Option key={loc.id} value={loc.id}>{loc.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
