import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Table, Spin, notification } from "antd"; // Ant Design components
import { PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  getUsersCount,
  getScrapeDataCount,
  getWebsitesCount,
  getUrlsCount,
} from "../services/apiService";

const Dashboard = () => {
  const [totalWebsites, setTotalWebsites] = useState(0);
  const [totalUrls, setTotalUrls] = useState(0);
  const [totalScrapedData, setTotalScrapedData] = useState(0);
  const [totalUsers, setTotalUsers] = useState({
    free: 0,
    paid: 0,
    concierge: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true before fetching data
      try {
        // Fetch data from all APIs
        const [websitesCount, urlsCount, scrapedDataCount, usersCount] =
          await Promise.all([
            getWebsitesCount(),
            getUrlsCount(),
            getScrapeDataCount(),
            getUsersCount(),
          ]);

        // Update the state with the fetched data
        setTotalWebsites(websitesCount?.count || 0); // Use optional chaining to prevent errors if response is undefined
        setTotalUrls(urlsCount?.count || 0);
        setTotalScrapedData(scrapedDataCount?.count || 0);
        setTotalUsers({
          free: usersCount?.freeCount || 0, // Make sure you're accessing usersCount data correctly
          paid: usersCount?.paidCount || 0,
          concierge: usersCount?.conciergeCount || 0,
        });
      } catch (error) {
        // Handle error
        console.error("Error fetching data:", error);
        // Optionally set default values or show an error message
        setTotalWebsites(0);
        setTotalUrls(0);
        setTotalScrapedData(0);
        setTotalUsers({
          free: 0,
          paid: 0,
          concierge: 0,
        });

        notification.error({
          message: "Data Fetch Error",
          description:
            "There was an issue fetching the data. Please try again later.",
        });
      } finally {
        // Set loading to false after data is fetched, regardless of success or failure
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // User breakdown data for the table
  const data = [
    { key: "1", plan: "Free Plan", count: totalUsers.free },
    { key: "2", plan: "Paid Plan", count: totalUsers.paid },
    { key: "3", plan: "Concierge Service Plan", count: totalUsers.concierge },
  ];

  const columns = [
    { title: "Plan", dataIndex: "plan", key: "plan" },
    { title: "Number of Users", dataIndex: "count", key: "count" },
  ];

  return (
    <div className="container mx-auto min-h-[86vh] p-6">

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Websites */}
        <Card className="bg-purple-600 text-white">
          <h3 className="text-lg font-semibold">Total Websites</h3>
          {loading ? <Spin /> : <p className="text-2xl">{totalWebsites}</p>}
        </Card>

        {/* Total URLs */}
        <Card className="bg-purple-600 text-white">
          <h3 className="text-lg font-semibold">Total URLs</h3>
          {loading ? <Spin /> : <p className="text-2xl">{totalUrls}</p>}
        </Card>

        {/* Total Scraped Data */}
        <Card className="bg-purple-600 text-white">
          <h3 className="text-lg font-semibold">Total Scraped Data</h3>
          {loading ? <Spin /> : <p className="text-2xl">{totalScrapedData}</p>}
        </Card>

        {/* Total Users */}
        <Card className="bg-purple-600 text-white">
          <h3 className="text-lg font-semibold">Total Users</h3>
          {loading ? (
            <Spin />
          ) : (
            <p className="text-2xl">
              {totalUsers.free + totalUsers.paid + totalUsers.concierge}
            </p>
          )}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="mt-2"
            disabled={loading}
          >
            View User Breakdown
          </Button>
        </Card>
      </div>

      {/* User Breakdown Modal */}
      <Modal
        title="User Breakdown"
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setIsModalOpen(false)}
            type="primary"
          >
            Close
          </Button>,
        ]}
      >
        <Table dataSource={data} columns={columns} pagination={false} />
      </Modal>
    </div>
  );
};

export default Dashboard;
