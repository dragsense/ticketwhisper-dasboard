import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  Button,
  Input,
  Select,
  Card,
  Checkbox,
  Form,
  Row,
  Col,
  notification,
  Popconfirm,
  Spin,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser as apiDeleteUser,
  getWebsites,
} from "../services/apiService"; // Adjust the import path based on your project structure
import NotificationsSettingModal from "./NotificationsSettingModal"; 

const { Option } = Select;

const preferredPlanOptions = {
  1: "Free Plan",
  2: "Paid Plan",
  3: "Concierge Service Plan",
};

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [form] = Form.useForm();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false); // Modal-specific loading state

  // New state variables for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

  // Fetch users from the server
  const fetchUsers = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      setLoading(true); // Start table loading
      const response1 = await getWebsites();
      const { websites } = response1;
      setWebsites(websites || []);

      const response = await getUsers(page, pageSize, filters);
      const { users, total } = response;

      setUsers(users || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: total || 0,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      notification.error({
        message: "Error fetching users",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false); // Stop table loading
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTableChange = (pagination) => {
    fetchUsers(pagination.current, pagination.pageSize, {
      name: searchTerm,
      whatsappNumber: searchTerm,
      preferredPlan: selectedPlan,
    });
  };

  const showModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setCurrentUser(user);
      form.setFieldsValue({
        name: user.name,
        whatsappNumber: user.whatsappNumber,
        email: user.email,
        instagram: user.instagramId,
        preferredPlan: "" + user.preferredPlan,
      });
    } else {
      setIsEditing(false);
      setCurrentUser(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      setModalLoading(true); // Start modal loading
      const values = await form.validateFields();
      const userData = {
        ...values,
        instagramId: values.instagram,
      };

      if (isEditing) {
        await updateUser(currentUser._id, userData);
        setUsers((prev) =>
          prev.map((user) =>
            user._id === currentUser._id ? { ...user, ...userData } : user
          )
        );
        notification.success({
          message: "User Updated",
          description: "The user has been updated successfully.",
        });
      } else {
        const response = await addUser(userData);
        setUsers([...users, response.data]);
        notification.success({
          message: "User Added",
          description: "The user has been added successfully.",
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.log("Validation failed:", error);
      notification.error({
        message: isEditing ? "Error Updating User" : "Error Adding User",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setModalLoading(false); // Stop modal loading
    }
  };

  const deleteUser = async (userId) => {
    try {
      setLoading(true); // Start loading during delete action
      await apiDeleteUser(userId);
      setUsers(users.filter((user) => user._id !== userId));
      notification.success({
        message: "User Deleted",
        description: "The user has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      notification.error({
        message: "Error Deleting User",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false); // Stop loading after delete action
    }
  };

  const handleSearch = () => {
    fetchUsers(pagination.current, pagination.pageSize, {
      name: searchTerm,
      whatsappNumber: searchTerm,
      preferredPlan: selectedPlan,
    });
  };

  const handlePlanChange = (value) => {
    setSelectedPlan(value);
    fetchUsers(pagination.current, pagination.pageSize, {
      name: searchTerm,
      whatsappNumber: searchTerm,
      preferredPlan: value,
    });
  };


  const openNotificationModal = () => {
    setIsNotificationModalOpen(true);
  };


  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "whatsapp Number",
      dataIndex: "whatsapp",
      key: "whatsapp",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Instagram ID",
      dataIndex: "instagramId",
      key: "instagramId",
    },
    {
      title: "Preferred Plan",
      dataIndex: "preferredPlan",
      key: "preferredPlan",
      render: (text) => preferredPlanOptions[text] || text,
    },
    {
      title: "Actions",
      key: "action",
      render: (_, user) => (
        <span>
          <Button
            onClick={() => showModal(user)}
            icon={<EditOutlined />}
            size="small"
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => deleteUser(user._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div className="container mx-auto min-h-[86vh] p-6">

      <Card
        title="Users"
        extra={<>
          <Button
              type="default"
              onClick={openNotificationModal}
              icon={<PlusOutlined />}
            >
              Notification Settings
            </Button> {" "}
          <Button
            type="primary"
            disabled={loading}
            onClick={() => showModal()}
            icon={<PlusOutlined />}
          >
            Add User
          </Button>
          </>}
        className="mb-4"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          {/* Search Input */}
          <div style={{ flex: "0 0 300px", marginRight: "8px" }}>
            <Form.Item
              label="Search by Name or WhatsApp"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input
                placeholder="Enter name or WhatsApp"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={handleSearch}
              />
            </Form.Item>
          </div>

          {/* Filter by Plan Select */}
          <div style={{ flex: "0 0 200px", marginRight: "8px" }}>
            <Form.Item
              label="Filter by Plan"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Select
                placeholder="Select a Preferred Plan"
                value={selectedPlan}
                onChange={handlePlanChange}
                allowClear
                style={{ width: "100%" }} // Set to 100% to fill the container
              >
                <Option value="1">Free Plan</Option>
                <Option value="2">Paid Plan</Option>
                <Option value="3">Concierge Service Plan</Option>
              </Select>
            </Form.Item>
          </div>

          
        </div>

        {/* User Table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="_id"
            pagination={pagination}
            onChange={handleTableChange}
          />
        </Spin>
      </Card>

      {/* Modal for Add/Edit User */}
      <Modal
        title={isEditing ? "Edit User" : "Add User"}
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={modalLoading}
        width={"60%"}
      >
        <Form layout="vertical">
        
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please enter the name" }]}
              >
                <Input placeholder="Enter name" />
              </Form.Item>
              <Form.Item
                label="WhatsApp"
                name="whatsappNumber"
                rules={[
                  {
                    required: true,
                    message: "Please enter the WhatsApp number",
                  },
                ]}
              >
                <Input placeholder="Enter WhatsApp number" />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input placeholder="Enter email" />
              </Form.Item>
              <Form.Item label="Instagram ID" name="instagram">
                <Input placeholder="Enter Instagram ID" />
              </Form.Item>
              <Form.Item
                label="Plan"
                name="preferredPlan"
                rules={[{ required: true, message: "Please select a preferredPlan" }]}
              >
                <Select placeholder="Select a Preferred Plan">
                  <Option value="1">Free Plan</Option>
                  <Option value="2">Paid Plan</Option>
                  <Option value="3">Concierge Service Plan</Option>
                </Select>
              </Form.Item>
           
        </Form>
      </Modal>

      <NotificationsSettingModal
        visible={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        _websites={websites}
      />
    </div>
  );
};

export default UsersManagement;
