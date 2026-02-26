import { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Typography, message, Popconfirm, Tooltip, Upload, Image, Rate, Card, Divider, Avatar, Calendar, Badge, DatePicker, TimePicker,
} from 'antd';
import {
    PlusOutlined, EditOutlined, SwapOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, UploadOutlined, DeleteOutlined, DownloadOutlined, StarOutlined, CommentOutlined, UserOutlined, CalendarOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
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
    const [reviewModal, setReviewModal] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [selectedHallForReview, setSelectedHallForReview] = useState(null);
    const [calendarModal, setCalendarModal] = useState(false);
    const [selectedHallForBooking, setSelectedHallForBooking] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [bookingDetailModal, setBookingDetailModal] = useState(false);
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [addBookingModal, setAddBookingModal] = useState(false);
    const [form] = Form.useForm();
    const [reviewForm] = Form.useForm();
    const [bookingForm] = Form.useForm();

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
        try { 
            const res = await hallApi.getDetail(id); 
            setDetailData(res.data.data); 
            // Mock reviews data - replace with API call when backend ready
            setReviews(res.data.data.reviews || []);
            setDetailModal(true); 
        }
        catch { message.error('Không thể tải chi tiết'); }
    };

    const handleViewReviews = (record) => {
        setSelectedHallForReview(record);
        // Mock reviews - replace with API call: hallApi.getReviews(record.id)
        const mockReviews = [
            { id: 1, userName: 'Nguyễn Văn A', rating: 5, comment: 'Hội trường rất đẹp, không gian thoáng mát', date: '2026-02-20' },
            { id: 2, userName: 'Trần Thị B', rating: 4, comment: 'Dịch vụ tốt, nhân viên nhiệt tình', date: '2026-02-18' },
            { id: 3, userName: 'Lê Văn C', rating: 5, comment: 'Âm thanh ánh sáng tuyệt vời, phù hợp tổ chức sự kiện lớn', date: '2026-02-15' },
        ];
        setReviews(mockReviews);
        setReviewModal(true);
    };

    const handleAddReview = async () => {
        try {
            const values = await reviewForm.validateFields();
            // Mock API call - replace with: hallApi.addReview(selectedHallForReview.id, values)
            const newReview = {
                id: Date.now(),
                userName: 'Người dùng hiện tại',
                rating: values.rating,
                comment: values.comment,
                date: new Date().toISOString().slice(0, 10),
            };
            setReviews([newReview, ...reviews]);
            message.success('Đánh giá của bạn đã được gửi!');
            reviewForm.resetFields();
        } catch (error) {
            message.error('Vui lòng điền đầy đủ thông tin!');
        }
    };

    const handleViewCalendar = (record) => {
        setSelectedHallForBooking(record);
        // Mock bookings - replace with API: hallApi.getBookings(record.id)
        const mockBookings = [
            { id: 1, date: '2026-02-28', customerName: 'Công ty ABC', eventType: 'Hội nghị', status: 'confirmed', time: '08:00-12:00' },
            { id: 2, date: '2026-03-01', customerName: 'Nguyễn Văn A', eventType: 'Tiệc cưới', status: 'confirmed', time: '18:00-22:00' },
            { id: 3, date: '2026-03-05', customerName: 'Công ty XYZ', eventType: 'Sự kiện', status: 'pending', time: '14:00-18:00' },
            { id: 4, date: '2026-03-08', customerName: 'Trần Thị B', eventType: 'Sinh nhật', status: 'confirmed', time: '19:00-23:00' },
            { id: 5, date: '2026-03-15', customerName: 'Lê Văn C', eventType: 'Hội thảo', status: 'cancelled', time: '09:00-17:00' },
        ];
        setBookings(mockBookings);
        setCalendarModal(true);
    };

    const getListData = (value) => {
        const dateStr = value.format('YYYY-MM-DD');
        return bookings.filter(booking => booking.date === dateStr);
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <div style={{ minHeight: 80 }}>
                {listData.map((item) => {
                    let color = 'blue';
                    if (item.status === 'confirmed') color = 'green';
                    if (item.status === 'pending') color = 'orange';
                    if (item.status === 'cancelled') color = 'red';
                    return (
                        <div key={item.id} style={{ marginBottom: 4 }}>
                            <Badge color={color} text={<span style={{ fontSize: 11 }}>{item.time} - {item.customerName}</span>} />
                        </div>
                    );
                })}
            </div>
        );
    };

    const onSelectDate = (value) => {
        const dateStr = value.format('YYYY-MM-DD');
        const dayBookings = bookings.filter(booking => booking.date === dateStr);
        if (dayBookings.length > 0) {
            setSelectedDate(dateStr);
            setSelectedBookings(dayBookings);
            setBookingDetailModal(true);
        } else {
            setSelectedDate(dateStr);
            bookingForm.setFieldsValue({ bookingDate: value });
            setAddBookingModal(true);
        }
    };

    const handleAddBooking = async () => {
        try {
            const values = await bookingForm.validateFields();
            // Mock API call - replace with: hallApi.addBooking(selectedHallForBooking.id, values)
            const newBooking = {
                id: Date.now(),
                date: values.bookingDate.format('YYYY-MM-DD'),
                customerName: values.customerName,
                eventType: values.eventType,
                status: 'pending',
                time: `${values.startTime.format('HH:mm')}-${values.endTime.format('HH:mm')}`,
            };
            setBookings([...bookings, newBooking]);
            message.success('Đã thêm booking mới!');
            bookingForm.resetFields();
            setAddBookingModal(false);
        } catch (error) {
            message.error('Vui lòng điền đầy đủ thông tin!');
        }
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

    const handleExport = () => {
        try {
            // Prepare data for export
            const exportData = data.map((item, index) => ({
                'STT': index + 1,
                'ID': item.id,
                'Mã': item.code,
                'Tên hội trường': item.name,
                'Sức chứa': item.capacity,
                'Chi nhánh': item.location?.name || '',
                'Ghi chú': item.notes || '',
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);
            
            // Set column widths
            ws['!cols'] = [
                { wch: 5 },  // STT
                { wch: 8 },  // ID
                { wch: 15 }, // Mã
                { wch: 30 }, // Tên
                { wch: 12 }, // Sức chứa
                { wch: 25 }, // Chi nhánh
                { wch: 30 }, // Ghi chú
            ];

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Hội trường');

            // Generate file name with timestamp
            const fileName = `Danh_sach_hoi_truong_${new Date().toISOString().slice(0, 10)}.xlsx`;
            
            // Export file
            XLSX.writeFile(wb, fileName);
            message.success('Xuất file Excel thành công!');
        } catch (error) {
            message.error('Xuất file thất bại!');
            console.error(error);
        }
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
            title: 'Đánh giá', dataIndex: 'rating', width: 140,
            render: (rating, record) => {
                const avgRating = rating || Math.random() * 2 + 3; // Mock data
                const reviewCount = record.reviewCount || Math.floor(Math.random() * 50 + 5); // Mock
                return (
                    <div>
                        <Rate disabled value={avgRating} style={{ fontSize: 14 }} />
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>({reviewCount} đánh giá)</div>
                    </div>
                );
            }
        },
        {
            title: 'Hành động', width: 210,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết"><Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)} style={{ color: '#4facfe' }} /></Tooltip>
                    <Tooltip title="Lịch đặt"><Button type="text" icon={<CalendarOutlined />} onClick={() => handleViewCalendar(record)} style={{ color: '#13c2c2' }} /></Tooltip>
                    <Tooltip title="Reviews"><Button type="text" icon={<CommentOutlined />} onClick={() => handleViewReviews(record)} style={{ color: '#ffa940' }} /></Tooltip>
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
                <Space>
                    <Button icon={<DownloadOutlined />} onClick={handleExport}
                        style={{ borderRadius: 8, height: 40, borderColor: '#52c41a', color: '#52c41a' }}>
                        Export Excel
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}
                        style={{ background: 'linear-gradient(135deg, #fa709a, #fee140)', border: 'none', borderRadius: 8, height: 40, color: '#333' }}>
                        Thêm mới
                    </Button>
                </Space>
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
                onChange={handleTableChange} scroll={{ x: 1100 }} />

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
                        
                        {reviews && reviews.length > 0 && (
                            <div style={{ marginTop: 24 }}>
                                <Divider />
                                <strong style={{ fontSize: 16 }}>⭐ Đánh giá gần đây</strong>
                                <div style={{ marginTop: 12, maxHeight: 200, overflowY: 'auto' }}>
                                    {reviews.slice(0, 3).map(review => (
                                        <div key={review.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong>{review.userName}</strong>
                                                <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
                                            </div>
                                            <p style={{ margin: '4px 0', color: '#666' }}>{review.comment}</p>
                                            <small style={{ color: '#999' }}>{review.date}</small>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Modal title={`💬 Reviews - ${selectedHallForReview?.name}`} open={reviewModal} 
                onCancel={() => setReviewModal(false)} footer={null} width={680}>
                <div>
                    {/* Form thêm review */}
                    <Card style={{ marginBottom: 16, background: '#fafafa' }}>
                        <Typography.Title level={5}>✍️ Viết đánh giá của bạn</Typography.Title>
                        <Form form={reviewForm} layout="vertical">
                            <Form.Item name="rating" label="Đánh giá" rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}>
                                <Rate />
                            </Form.Item>
                            <Form.Item name="comment" label="Nhận xét" rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}>
                                <TextArea rows={3} placeholder="Chia sẻ trải nghiệm của bạn về hội trường này..." />
                            </Form.Item>
                            <Button type="primary" icon={<StarOutlined />} onClick={handleAddReview}>
                                Gửi đánh giá
                            </Button>
                        </Form>
                    </Card>

                    {/* Danh sách reviews */}
                    <div>
                        <Typography.Title level={5}>📝 Tất cả đánh giá ({reviews.length})</Typography.Title>
                        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                            {reviews.length > 0 ? reviews.map(review => (
                                <Card key={review.id} size="small" style={{ marginBottom: 12 }}>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong>{review.userName}</strong>
                                                <small style={{ color: '#999' }}>{review.date}</small>
                                            </div>
                                            <Rate disabled value={review.rating} style={{ fontSize: 14, margin: '4px 0' }} />
                                            <p style={{ margin: '8px 0 0', color: '#666' }}>{review.comment}</p>
                                        </div>
                                    </div>
                                </Card>
                            )) : (
                                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                                    Chưa có đánh giá nào. Hãy là người đầu tiên!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)} width={800}>
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>

            {/* Calendar Modal */}
            <Modal 
                title={<div><CalendarOutlined /> Lịch đặt sảnh - {selectedHallForBooking?.name}</div>} 
                open={calendarModal} 
                onCancel={() => setCalendarModal(false)} 
                footer={null} 
                width={900}
            >
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <Badge color="green" text="Đã xác nhận" />
                        <Badge color="orange" text="Chờ xác nhận" />
                        <Badge color="red" text="Đã hủy" />
                    </Space>
                </div>
                <Calendar 
                    cellRender={dateCellRender} 
                    onSelect={onSelectDate}
                    style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16 }}
                />
                <div style={{ marginTop: 16, textAlign: 'center', color: '#999' }}>
                    💡 Click vào ngày để xem chi tiết hoặc thêm booking mới
                </div>
            </Modal>

            {/* Booking Detail Modal */}
            <Modal
                title={`📅 Chi tiết booking - ${selectedDate}`}
                open={bookingDetailModal}
                onCancel={() => setBookingDetailModal(false)}
                footer={<Button onClick={() => setBookingDetailModal(false)}>Đóng</Button>}
                width={600}
            >
                {selectedBookings.map(booking => {
                    let statusColor = 'blue';
                    let statusText = 'Đang xử lý';
                    if (booking.status === 'confirmed') { statusColor = 'green'; statusText = 'Đã xác nhận'; }
                    if (booking.status === 'pending') { statusColor = 'orange'; statusText = 'Chờ xác nhận'; }
                    if (booking.status === 'cancelled') { statusColor = 'red'; statusText = 'Đã hủy'; }
                    
                    return (
                        <Card key={booking.id} size="small" style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div><strong>Khách hàng:</strong> {booking.customerName}</div>
                                    <div><strong>Loại sự kiện:</strong> {booking.eventType}</div>
                                    <div><strong>Thời gian:</strong> {booking.time}</div>
                                    <div><strong>Trạng thái:</strong> <Tag color={statusColor}>{statusText}</Tag></div>
                                </div>
                                <Space direction="vertical">
                                    {booking.status === 'pending' && (
                                        <Button type="primary" size="small" onClick={() => message.success('Đã xác nhận booking!')}>Xác nhận</Button>
                                    )}
                                    {booking.status !== 'cancelled' && (
                                        <Button danger size="small" onClick={() => message.info('Đã hủy booking!')}>Hủy</Button>
                                    )}
                                </Space>
                            </div>
                        </Card>
                    );
                })}
            </Modal>

            {/* Add Booking Modal */}
            <Modal
                title={`➕ Thêm booking mới - ${selectedDate}`}
                open={addBookingModal}
                onCancel={() => { setAddBookingModal(false); bookingForm.resetFields(); }}
                onOk={handleAddBooking}
                okText="Thêm booking"
                cancelText="Hủy"
                width={520}
            >
                <Form form={bookingForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="bookingDate" label="Ngày đặt" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="Nhập tên khách hàng" />
                    </Form.Item>
                    <Form.Item name="eventType" label="Loại sự kiện" rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện' }]}>
                        <Select placeholder="Chọn loại sự kiện">
                            <Select.Option value="Tiệc cưới">Tiệc cưới</Select.Option>
                            <Select.Option value="Hội nghị">Hội nghị</Select.Option>
                            <Select.Option value="Hội thảo">Hội thảo</Select.Option>
                            <Select.Option value="Sinh nhật">Sinh nhật</Select.Option>
                            <Select.Option value="Sự kiện">Sự kiện</Select.Option>
                            <Select.Option value="Khác">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Space style={{ width: '100%' }}>
                        <Form.Item name="startTime" label="Giờ bắt đầu" rules={[{ required: true, message: 'Chọn giờ' }]} style={{ flex: 1 }}>
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="endTime" label="Giờ kết thúc" rules={[{ required: true, message: 'Chọn giờ' }]} style={{ flex: 1 }}>
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>
        </div>
    );
}
