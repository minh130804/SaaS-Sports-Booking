import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Tag, Popconfirm, Row, Col, TimePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DribbbleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../../api/axiosClient';

const FieldList = () => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isOwner = userInfo.role === 'OWNER';

    const fetchFields = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/fields');

            const formattedFields = response.data.data.map(field => {
                let parsedPricing = field.pricing;
                if (typeof parsedPricing === 'string') {
                    try { parsedPricing = JSON.parse(parsedPricing); } 
                    catch (e) { parsedPricing = []; }
                }
                return { ...field, pricing: parsedPricing };
            });

            setFields(formattedFields);
        } catch (error) {
            message.error('Lỗi khi tải danh sách sân');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFields();
    }, []);

    const showAddModal = () => {
        setEditingId(null);
        form.resetFields();
        form.setFieldsValue({
            pricing: [{ startTime: dayjs('05:00', 'HH:mm'), endTime: dayjs('12:00', 'HH:mm'), price: 100000 }]
        });
        setIsModalVisible(true);
    };

    const showEditModal = (record) => {
        setEditingId(record.id);

        const formattedRecord = {
            ...record,
            pricing: (record.pricing || []).map(p => ({
                ...p,
                startTime: p.startTime ? dayjs(p.startTime, 'HH:mm') : null,
                endTime: p.endTime ? dayjs(p.endTime, 'HH:mm') : null
            }))
        };
        form.setFieldsValue(formattedRecord);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/fields/${id}`);
            message.success('Đã đưa sân vào thùng rác!');
            fetchFields();
        } catch (error) {
            message.error('Lỗi khi xóa sân');
        }
    };

    const handleRestore = async (id) => {
        try {
            await axiosClient.put(`/fields/${id}/restore`);
            message.success('Đã khôi phục sân thành công!');
            fetchFields();
        } catch (error) {
            message.error('Lỗi khi khôi phục sân');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const formattedValues = {
                ...values,
                pricing: (values.pricing || []).map(p => ({
                    ...p,
                    startTime: p.startTime && dayjs.isDayjs(p.startTime) ? p.startTime.format('HH:mm') : p.startTime,
                    endTime: p.endTime && dayjs.isDayjs(p.endTime) ? p.endTime.format('HH:mm') : p.endTime
                }))
            };

            if (editingId) {
                await axiosClient.put(`/fields/${editingId}`, formattedValues);
                message.success('Cập nhật thành công');
            } else {
                await axiosClient.post('/fields', formattedValues);
                message.success('Thêm mới thành công');
            }
            setIsModalVisible(false);
            fetchFields();
        } catch (error) {
            if (error.response) {
                message.error(error.response.data.message || 'Lỗi thao tác');
            } else {
                console.log('Form validation failed:', error);
            }
        }
    };

    const renderSportTag = (type) => {
        let color = 'default';
        if (type?.includes('Bóng đá')) color = 'green';
        else if (type?.includes('Cầu lông')) color = 'cyan';
        else if (type?.includes('Bóng bàn')) color = 'orange';
        else if (type?.includes('Pickleball')) color = 'purple';
        return <Tag color={color}>{type}</Tag>;
    };

    const columns = [
        { title: 'Tên Sân / Bàn', dataIndex: 'name', key: 'name', fontWeight: 'bold' },
        { title: 'Địa chỉ Cơ sở', dataIndex: 'address', key: 'address' },
        { title: 'Môn Thể Thao', dataIndex: 'type', key: 'type', render: renderSportTag },
        { 
            title: 'Bảng giá theo giờ', 
            dataIndex: 'pricing', 
            key: 'pricing',
            render: (pricing) => (
                <div style={{ fontSize: '13px' }}>
                    {Array.isArray(pricing) && pricing.map((p, idx) => (
                        <div key={idx} style={{ marginBottom: 4 }}>
                            <Tag>{p.startTime} - {p.endTime}</Tag>
                            <b style={{ color: '#52c41a' }}>{Number(p.price).toLocaleString()}đ</b>
                        </div>
                    ))}
                </div>
            )
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status, record) => {
                if (record.deletedAt) return <Tag color="default" style={{ color: '#999' }}>ĐÃ TẠM XÓA</Tag>;
                return <Tag color={status === 'AVAILABLE' ? 'success' : 'error'}>
                    {status === 'AVAILABLE' ? 'SẴN SÀNG' : 'BẢO TRÌ'}
                </Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {

                if (!isOwner) {
                    return <Tag color="orange">Chỉ xem</Tag>;
                }

                if (record.deletedAt) {
                    return <Button type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => handleRestore(record.id)}>Khôi phục</Button>;
                }
                
                return (
                    <Space size="middle">
                        <Button type="primary" ghost icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)}>Sửa</Button>
                        <Popconfirm title="Tạm khóa (xóa mềm) sân này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                            <Button danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}><DribbbleOutlined style={{ marginRight: 10, color: '#1890ff' }}/>Quản lý Tổ Hợp Thể Thao</h2>

                {isOwner && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                        Thêm sân mới
                    </Button>
                )}
            </div>

            <Table 
                columns={columns} 
                dataSource={fields} 
                rowKey="id" 
                loading={loading} 
                bordered 
                rowClassName={(record) => record.deletedAt ? 'deleted-row' : ''}
            />

            <Modal 
                title={editingId ? "Cập nhật Thông tin" : "Thêm Sân Thể Thao Mới"} 
                open={isModalVisible} 
                onOk={handleOk} 
                onCancel={() => setIsModalVisible(false)}
                width={700}
                okText="Lưu lại"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Tên Sân / Bàn" name="name" rules={[{ required: true, message: 'Nhập tên!' }]}>
                                <Input placeholder="VD: Sân Bóng 7A" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Môn thể thao" name="type" rules={[{ required: true, message: 'Chọn loại!' }]}>
                                <Select placeholder="-- Chọn môn thể thao --">
                                    <Select.Option value="Cầu lông">🏸 Cầu lông</Select.Option>
                                    <Select.Option value="Bóng bàn">🏓 Bóng bàn</Select.Option>
                                    <Select.Option value="Pickleball">🎾 Pickleball</Select.Option>
                                    <Select.OptGroup label="⚽ Bóng đá">
                                        <Select.Option value="Bóng đá - Sân 7 người">Sân 7 người</Select.Option>
                                        <Select.Option value="Bóng đá - Sân 11 người">Sân 11 người</Select.Option>
                                    </Select.OptGroup>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Địa chỉ sân (Cơ sở)" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
                        <Input placeholder="VD: 123 Đường A, Quận B, TP.HCM" />
                    </Form.Item>

                    <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 16px 0' }}>Bảng giá theo khung giờ</h4>
                        <Form.List name="pricing">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Form.Item {...restField} name={[name, 'startTime']} rules={[{ required: true, message: 'Thiếu giờ' }]}>
                                                <TimePicker format="HH:mm" placeholder="Bắt đầu" style={{ width: 120 }} />
                                            </Form.Item>
                                            <span>đến</span>
                                            <Form.Item {...restField} name={[name, 'endTime']} rules={[{ required: true, message: 'Thiếu giờ' }]}>
                                                <TimePicker format="HH:mm" placeholder="Kết thúc" style={{ width: 120 }} />
                                            </Form.Item>
                                            <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true, message: 'Nhập giá' }]}>
                                                <InputNumber placeholder="Giá tiền (VNĐ)" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} min={0} step={10000} style={{ width: 150 }} />
                                            </Form.Item>
                                            {fields.length > 1 && (
                                                <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                                            )}
                                        </Space>
                                    ))}
                                    <Form.Item style={{ marginBottom: 0 }}>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Thêm khung giờ
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </div>

                    <Form.Item label="Trạng thái hoạt động" name="status" initialValue="AVAILABLE">
                        <Select>
                            <Select.Option value="AVAILABLE">Sẵn sàng phục vụ</Select.Option>
                            <Select.Option value="MAINTENANCE">Đang bảo trì / Sửa chữa</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default FieldList;