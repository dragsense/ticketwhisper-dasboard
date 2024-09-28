import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Form,
  Card,
  notification,
  Popconfirm,
  Select,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import {
  addWebsite,
  updateWebsite,
  getWebsites,
  deleteWebsite,
} from "../services/apiService";

const { Option } = Select;

const WebsitesList = () => {
  const [websites, setWebsites] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [wrapperSelector, setWrapperSelector] = useState("");
  const [scrapFields, setScrapFields] = useState([
    { selector: "", fieldTitle: "", contentType: "innerText" },
  ]);
  const [loading, setLoading] = useState(false); // Loading state

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    total: 0,
  });

  // Search state
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchWebsites(pagination.current, pagination.pageSize, filter);
  }, []); // Refetch data when page changes or search changes

  const fetchWebsites = async (page, pageSize, filter) => {
    setLoading(true); // Start loading
    try {
      const response = await getWebsites(page, pageSize, filter);
      const { websites, total } = response; // Assuming the API response provides data and total

      setWebsites(websites || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: total || 0, // Total number of items to handle pagination
      }));
    } catch (error) {
      notification.error({
        message: "Error fetching websites",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleSearch = () => {
    fetchWebsites(pagination.current, pagination.pageSize, filter);
  };

  const handleTableChange = (pagination) => {
    fetchWebsites(pagination.current, pagination.pageSize, filter);
  };



  const handleAddWebsite = async () => {
    if (name && url) {
      const newWebsite = { name, url, wrapperSelector, scrapFields };
      setLoading(true); // Start loading
      try {
        await addWebsite(newWebsite);
        fetchWebsites(); // Refresh the list after adding
        clearForm();
        setIsModalVisible(false); // Close the modal after adding
        notification.success({
          message: "Website Added",
          description: "The website has been added successfully.",
        });
      } catch (error) {
        
        notification.error({
          message: "Error adding website",
          description: error.response?.data?.error || error.message,
        });
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      alert("Website Name and Url are required!");
    }
  };
  
  const handleDeleteWebsite = async (index) => {
    const websiteToDelete = websites[index];
    setLoading(true); // Start loading
    try {
      await deleteWebsite(websiteToDelete._id);
      fetchWebsites(); // Refresh the list after deletion
      notification.success({
        message: "Website Deleted",
        description: "The website has been deleted successfully.",
      });
    } catch (error) {
      notification.error({
        message: "Error deleting website",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
  const handleUpdateWebsite = async () => {
    const updatedWebsite = {
      ...selectedWebsite,
      name,
      url,
      wrapperSelector,
      scrapFields,
    };
    setLoading(true); // Start loading
    try {
      await updateWebsite(updatedWebsite._id, updatedWebsite);
      fetchWebsites(); // Refresh the list after updating
      setIsModalVisible(false);
      clearForm();
      notification.success({
        message: "Website Updated",
        description: "The website has been updated successfully.",
      });
    } catch (error) {
      notification.error({
        message: "Error updating website",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
  const clearForm = () => {
    setName("");
    setWrapperSelector("");
    setScrapFields([
      { selector: "", fieldTitle: "", contentType: "innerText" },
    ]);
    setSelectedWebsite(null); // Reset the selected website
  };

  const handleOpenModal = (website = null) => {
    if (website) {
      setSelectedWebsite(website);
      setName(website.name);
      setUrl(website.url);
      setWrapperSelector(website.wrapperSelector);
      setScrapFields(website.scrapFields);
    } else {
      clearForm(); // Clear the form for new website addition
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    clearForm();
  };

  const handleRemoveScrapField = (index) => {
    const updatedFields = scrapFields.filter((_, i) => i !== index);
    setScrapFields(updatedFields);
  };

  return (
    <div className="container mx-auto min-h-[86vh] p-6">

      <Card
        title="Websites List"
        extra={
          <Button
            type="primary"
            disabled={loading}
            onClick={() => handleOpenModal()}
          >
            <PlusOutlined /> Add Website
          </Button>
        }
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
              label="Search by Name"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <Input
                placeholder="Enter name"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onPressEnter={handleSearch}
              />
            </Form.Item>
          </div>

         
        </div>

        <Table
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
           
          }}
          onChange={handleTableChange}
          className="mt-4"
          dataSource={websites}
          rowKey={(record) => record._id}
          loading={loading} // Set loading state for the table
        >
          <Table.Column title="Name" dataIndex="name" />
          <Table.Column title="Url" dataIndex="url" />
          <Table.Column title="Wrapper Selector" dataIndex="wrapperSelector" />
          <Table.Column
            title="Fields"
            render={(text, website) => (
              <>
                {website.scrapFields.map((field, idx) => (
                  <div key={idx}>
                    {field.fieldTitle} ({field.selector})
                  </div>
                ))}
              </>
            )}
          />
          <Table.Column
            title="Actions"
            render={(text, website, index) => (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleOpenModal(website)}
                />
                <Popconfirm
                  title="Are you sure you want to delete this website?"
                  onConfirm={() => handleDeleteWebsite(index)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="danger"
                    icon={<DeleteOutlined />}
                    className="ml-2"
                  />
                </Popconfirm>
              </>
            )}
          />
        </Table>
      </Card>

      {/* Add/Edit Website Modal */}
      <Modal
        title={selectedWebsite ? "Update Website" : "Add Website"}
        open={isModalVisible}
        onOk={selectedWebsite ? handleUpdateWebsite : handleAddWebsite}
        onCancel={handleCancel}
        okText="Save"
        width={"60%"}
        confirmLoading={loading} // Show loading state in modal
      >
        <Form layout="vertical">
          <Form.Item label="Website Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter website name"
            />
          </Form.Item>
           
          <Form.Item label="Website Url" required>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website url"
            />
          </Form.Item>

          <Form.Item label="Wrapper Selector" required>
            <Input
              value={wrapperSelector}
              onChange={(e) => setWrapperSelector(e.target.value)}
              placeholder="Enter wrapper selector"
            />
          </Form.Item>

          <h4>Scrap Fields</h4>
          {scrapFields.map((field, index) => (
            <div key={index} style={{ display: "flex", marginBottom: 8 }}>
              <Form.Item style={{ flex: 1, marginRight: 5 }}>
                <Input
                  value={field.fieldTitle}
                  onChange={(e) =>
                    setScrapFields((prev) =>
                      prev.map((f, i) =>
                        i === index ? { ...f, fieldTitle: e.target.value } : f
                      )
                    )
                  }
                  placeholder="Field Title"
                />
              </Form.Item>
              <Form.Item style={{ flex: 1, marginRight: 5 }}>
                <Input
                  value={field.selector}
                  onChange={(e) =>
                    setScrapFields((prev) =>
                      prev.map((f, i) =>
                        i === index ? { ...f, selector: e.target.value } : f
                      )
                    )
                  }
                  placeholder="Selector"
                />
              </Form.Item>
              <Form.Item style={{ flex: 1 }}>
                <Select
                  value={field.contentType} // The selected content type
                  onChange={(value) =>
                    setScrapFields((prev) =>
                      prev.map((f, i) =>
                        i === index ? { ...f, contentType: value } : f
                      )
                    )
                  }
                  placeholder="Select content type"
                >
                  {/* Available options */}
                  <Option value="innerText">Inner Text</Option>
                  <Option value="src">Source (src)</Option>
                  <Option value="href">Link (href)</Option>
                  <Option value="value">Input Value</Option>
                </Select>
              </Form.Item>
              <MinusCircleOutlined
                onClick={() => handleRemoveScrapField(index)}
                style={{
                  alignSelf: "center",
                  cursor: "pointer",
                  marginLeft: 8,
                }}
              />
            </div>
          ))}
          <Button
            type="dashed"
            onClick={() =>
              setScrapFields((prev) => [
                ...prev,
                { selector: "", fieldTitle: "", contentType: "innerText" },
              ])
            }
            style={{ width: "100%", marginTop: 8 }}
          >
            <PlusOutlined /> Add Scrap Field
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default WebsitesList;
