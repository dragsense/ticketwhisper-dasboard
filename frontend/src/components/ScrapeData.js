import React, { useEffect, useState } from "react";
import {
  Tabs,
  Button,
  Table,
  List,
  Modal,
  Form,
  Input,
  Card,
  notification,
  Popconfirm,
  Select,
  Row,
  Col,
  Pagination,
  Spin,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  getUrls,
  getWebsites,
  addUrl,
  updateUrl,
  deleteUrl,
  getScrappedData,
  deleteScrapData,
  scrapData,
} from "../services/apiService";

const ScrappData = () => {
  const { TabPane } = Tabs;
  const { Option } = Select;

  // Websites and URLs state
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState({});
  const [urls, setUrls] = useState([]);

  // Loading states
  const [loadingWebsites, setLoadingWebsites] = useState(false);
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [loadingScrapedData, setLoadingScrapedData] = useState(false);

  // Pagination state for URLs
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
    total: 0,
  });

  // Selected URL to display scraped data
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [scrapeData, setScrapedData] = useState([]);

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newUrl, setNewUrl] = useState({});

  // Form instance
  const [form] = Form.useForm();

  // State for filtering URLs
  const [filter, setFilter] = useState("");

  // State for scraped data pagination
  const [scrapedDataPagination, setScrapedDataPagination] = useState({
    pageSize: 10,
    current: 1,
    total: 0,
  });

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    setLoadingWebsites(true);
    try {
      const response = await getWebsites();
      const { websites } = response;
      setWebsites(websites || []);
      if (websites.length > 0) {
        setSelectedWebsite(websites[0]); // Default to the first website
      }
    } catch (error) {
      notification.error({
        message: "Error fetching websites",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoadingWebsites(false);
    }
  };

  useEffect(() => {
    if (selectedWebsite?._id) {
      const dynamicColumns = selectedWebsite.scrapFields.map((field) => ({
        title: field.fieldTitle, // Column title
        dataIndex: field.fieldTitle, // Column data index
        key: field.fieldTitle, // Unique key for column

        // Check if the contentType is "href", then wrap it in an anchor tag
        render: (text) => {
          if (field.contentType === "href") {
            return (
              <a href={text} target="_blank" rel="noopener noreferrer">
                {text}
              </a>
            );
          }
          return text; // If it's not href, just return the text normally
        },
      }));

      // Set the dynamic columns
      setColumns(dynamicColumns);

      fetchUrls(
        selectedWebsite._id,
        pagination.current,
        pagination.pageSize,
        filter
      );
    }
  }, [selectedWebsite]);

  useEffect(() => {
    if (selectedUrl) {
      fetchScrapedData(
        selectedUrl._id,
        scrapedDataPagination.current,
        scrapedDataPagination.pageSize
      );
    }
  }, [selectedUrl]);

  const fetchUrls = async (websiteId, page, pageSize, filter) => {
    setLoadingUrls(true);
    try {
      const response = await getUrls(websiteId, page, pageSize, filter);
      const { urls, total } = response;
      setUrls(urls || []);
      if (urls.length > 0) {
        setSelectedUrl(urls[0]); // Default to the first URL
      }
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: total || 0,
      }));
    } catch (error) {
      notification.error({
        message: "Error fetching URLs",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoadingUrls(false);
    }
  };


  const fetchScrapedData = async (urlId, page, pageSize) => {
    setLoadingScrapedData(true);

  
    try {
      const response = await getScrappedData(urlId, page, pageSize);
      const { data, total } = response;

      setScrapedData(data || []);
      setScrapedDataPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: total || 0,
      }));
    } catch (error) {
      notification.error({
        message: "Error fetching scraped data",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoadingScrapedData(false);
    }
  };

  const addNewUrl = async () => {
    try {
      await addUrl(selectedWebsite._id, newUrl);
      setNewUrl({});
      setIsModalVisible(false);
      form.resetFields(); // Reset the form fields
      fetchUrls(
        selectedWebsite._id,
        pagination.current,
        pagination.pageSize,
        filter
      ); // Refresh URLs
      setSelectedUrl(newUrl);
      notification.success({
        message: "URL Added",
        description: "The URL was successfully added to the website.",
      });
    } catch (error) {
      notification.error({
        message: "Error adding URL",
        description: error.response?.data?.error || error.message,
      });
    }
  };

  const openEditModal = (url) => {
    setNewUrl(url);
    form.setFieldsValue({ name: url.name, url: url.url, pageLimit: url.pageLimit, nextPageSelector: url.nextPageSelector }); // Set form values
    setIsModalVisible(true);
  };

  const deleteWebsiteUrl = async (urlId) => {
    try {
      await deleteUrl(urlId);
      fetchUrls(
        selectedWebsite._id,
        pagination.current,
        pagination.pageSize,
        filter
      ); // Refresh URLs
      notification.success({
        message: "URL Deleted",
        description: "The URL was successfully deleted.",
      });
    } catch (error) {
      notification.error({
        message: "Error deleting URL",
        description: error.response?.data?.error || error.message,
      });
    }
  };

  const deleteUrlScrapeData = async (urlId) => {
    try {
      await deleteScrapData(urlId);
      fetchScrapedData(
        urlId,
        scrapedDataPagination.current,
        scrapedDataPagination.pageSize
      );
      notification.success({
        message: "Scraped Data Deleted",
        description: "The scraped data for the URL was successfully deleted.",
      });
    } catch (error) {
      notification.error({
        message: "Error deleting URL Data",
        description: error.response?.data?.error || error.message,
      });
    }
  };

  const scrapUrlData = async (urlId) => {
    try {
      await scrapData(urlId);
      fetchScrapedData(
        urlId,
        scrapedDataPagination.current,
        scrapedDataPagination.pageSize
      );
      notification.success({
        message: "Data Scraped",
        description: "Data for the URL was successfully scraped.",
      });
    } catch (error) {
      notification.error({
        message: "Error Scraping URL Data",
        description: error.response?.data?.error || error.message,
      });
    }
  };

  const updateWebsiteUrl = async (urlId) => {
    try {
      await updateUrl(urlId, newUrl);
      setNewUrl({});
      setIsModalVisible(false);
      form.resetFields(); // Reset the form fields
      fetchUrls(
        selectedWebsite._id,
        pagination.current,
        pagination.pageSize,
        filter
      ); // Refresh URLs
      notification.success({
        message: "URL Updated",
        description: "The URL was successfully updated.",
      });
    } catch (error) {
      notification.error({
        message: "Error updating URL",
        description: error.response?.data?.error || error.message,
      });
    }
  };

  const handleTableChange = (pagination) => {
    fetchUrls(
      selectedWebsite._id,
      pagination.current,
      pagination.pageSize,
      filter
    );
  };

  const handleScrapedDataTableChange = (pagination) => {
    fetchScrapedData(selectedUrl._id, pagination.current, pagination.pageSize);
  };

  const handleSearch = () => {
    fetchUrls(
      selectedWebsite._id,
      pagination.current,
      pagination.pageSize,
      filter
    );
  };

  const [columns, setColumns] = useState([]);

  const transformedData = scrapeData.map((item) => ({
    key: item._id, // Assuming urlId is unique for each entry
    ...item.data,
  }));

  return (
    <div className="container mx-auto min-h-[86vh] p-6">

      <Tabs defaultActiveKey="0">
        {loadingWebsites ? (
          <Spin size="large" />
        ) : (
          websites.map((website, wIdx) => (
            <TabPane
              tab={website.name}
              key={wIdx}
              onClick={() => setSelectedWebsite(website)}
            >
              <Row gutter={16}>
                {/* Left Column: URLs List */}
                <Col span={8}>
                  <Card
                  loading={loadingUrls}
                    title="URL List"
                    extra={
                      <Button
                        type="primary"
                        disabled={loadingScrapedData || loadingUrls}
                        onClick={() => {
                          setNewUrl({}); // Reset for new URL
                          setIsModalVisible(true);
                        }}
                      >
                        <PlusOutlined /> Add URL
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
                            style={{ width: "100%" }}
                            placeholder="Enter name"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            onPressEnter={handleSearch}
                          />
                        </Form.Item>
                      </div>

                    </div>

                    {loadingUrls ? (
                      <Spin />
                    ) : (
                      <List
                        dataSource={urls}
                        renderItem={(url) => (
                          <List.Item
                            className={`${
                              selectedUrl && selectedUrl._id === url._id
                                ? "bg-purple-200" // Existing class for selected state
                                : "bg-white" // Background color for unselected state
                            } p-4 rounded-lg shadow-md hover:bg-purple-100 transition duration-200`}
                          >
                            <div className="flex justify-between items-center w-full px-3">
                              <span className="font-bold text-lg ">
                                {url.name}
                              </span>{" "}
                              {/* Bold and larger text */}
                              <div className="flex space-x-3">
                                <Button
                                  onClick={() => openEditModal(url)}
                                  icon={<EditOutlined />}
                                  type="text"
                                />
                                <Button
                                  icon={<EyeOutlined />}
                                  type="text"
                                  onClick={() => {
                                    setSelectedUrl(url);
                                  }}
                                />
                                <Popconfirm
                                  title="Are you sure to delete this URL? This will also delete all scraped data related to this URL."
                                  onConfirm={() => deleteWebsiteUrl(url._id)}
                                >
                                  <Button
                                    icon={<DeleteOutlined />}
                                    type="text"
                                    danger
                                  />
                                </Popconfirm>
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    )}
                    <br />
                    <Pagination
                      current={pagination.current}
                      pageSize={pagination.pageSize}
                      total={pagination.total}
                      onChange={handleTableChange}
                    />
                  </Card>
                </Col>

                {/* Right Column: Scraped Data */}
                <Col span={16}>
                  <Card
                
                    title={`Scraped Data ${
                      selectedUrl ? `: ${selectedUrl.name}` : ""
                    }`} 
                    extra={
                      selectedUrl && (
                        <>
                          <Popconfirm
                            title="Are you sure you want to scrape this URL's data? This action will delete any existing data related to this URL."
                            onConfirm={() => scrapUrlData(selectedUrl._id)}
                          >
                            <Button
                              type="default"
                              disabled={loadingUrls || loadingScrapedData} // Disable button if loading
                            >
                              Scrape Data
                            </Button>
                          </Popconfirm>{" "}
                          <Popconfirm
                            title="Are you sure to delete this URL Data?"
                            onConfirm={() =>
                              deleteUrlScrapeData(selectedUrl._id)
                            }
                          >
                            <Button
                              danger
                              type="primary"
                              disabled={loadingUrls || loadingScrapedData} // Disable button if loading
                            >
                              Erase Data
                            </Button>
                          </Popconfirm>
                        </>
                      )
                    }
                  >
                    
                      <Spin spinning={loadingScrapedData}>
                   
                      {selectedUrl && (
                    
                          <Table
                            dataSource={transformedData}
                            columns={columns}
                            pagination={{
                              pageSize: scrapedDataPagination.pageSize,
                              current: scrapedDataPagination.current,
                              total: scrapedDataPagination.total,
                            }}
                            onChange={handleScrapedDataTableChange}
                            scroll={{ y: 500 }}
                          />
                       
                      )}
                    </Spin>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          ))
        )}
      </Tabs>

      <Modal
        title={newUrl._id ? "Edit URL" : "Add URL"}
        open={isModalVisible}
        onOk={newUrl._id ? () => updateWebsiteUrl(newUrl._id) : addNewUrl}
        okText="Save"
        onCancel={() => {
          setIsModalVisible(false);
          setNewUrl({});
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input the URL name!" }]}
          >
            <Input
              value={newUrl.name}
              onChange={(e) => setNewUrl({ ...newUrl, name: e.target.value })}
            />
          </Form.Item>
          <Form.Item
            label="URL"
            name="url"
            rules={[{ required: true, message: "Please input the URL!" }]}
          >
            <Input
              value={newUrl.url}
              onChange={(e) => setNewUrl({ ...newUrl, url: e.target.value })}
            />
          </Form.Item>
          <Form.Item
            label="Page Limit"
            name="pageLimit"
            
          >
            <Input
            type="number"
              value={newUrl.pageLimit}
              onChange={(e) => setNewUrl({ ...newUrl, pageLimit: e.target.value })}
            />
          </Form.Item>
          <Form.Item
            label="Next Page Selector"
            name="nextPageSelector"
          >
            <Input
              value={newUrl.nextPageSelector}
              onChange={(e) => setNewUrl({ ...newUrl, nextPageSelector: e.target.value })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScrappData;
