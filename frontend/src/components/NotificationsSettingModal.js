import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  Checkbox,
  notification,
  Spin,
  Button,
} from "antd";
import {
  getNotificationsSetting,
  updateNotificationsSetting,
} from "../services/apiService"; // Adjust your API service path

const { Option } = Select;

const NotificationsSettingModal = ({ visible, onClose, _websites }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // Overall loading state
  const [fetchingSettings, setFetchingSettings] = useState(false); // For fetching data
  const [selectedPlan, setSelectedPlan] = useState("");

  const fetchNotificationSettings = async (plan) => {
    try {
      setFetchingSettings(true);
      const response = await getNotificationsSetting(plan);
      const { frequency, rows, sendLinks, websites } = response || {};

      // Fill the form with the fetched data
      form.setFieldsValue({
        frequency: frequency || "daily",
        rows: rows || 5,
        sendLinks: sendLinks || false,
        websites: websites || [],
      });
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      notification.error({
        message: "Error Fetching Notification Settings",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setFetchingSettings(false);
    }
  };

  useEffect(() => {
    if (selectedPlan) {
      fetchNotificationSettings(selectedPlan);
    }
  }, [selectedPlan]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true); // Set loading state during the update process

      await updateNotificationsSetting(selectedPlan, values);

      notification.success({
        message: "Notification Settings Updated",
        description:
          "The notification settings have been updated successfully.",
      });
      onClose();
    } catch (error) {
      notification.error({
        message: "Error Saving Settings",
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false); // Stop loading after the update process
    }
  };

  return (
    <Modal
      title="Notification Settings"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="update"
          type="primary"
          onClick={handleUpdate}
          loading={loading} // Show loading when the update process is happening
          disabled={!selectedPlan} // Disable update button until a plan is selected
        >
          Update
        </Button>,
      ]}
      width={"50%"}
    >
      <Spin spinning={loading || fetchingSettings}> {/* Show spinner when loading */}
        <Form layout="vertical" form={form}>
          <Form.Item label="Preferred Plan" name="preferredPlan">
            <Select
              placeholder="Select a Plan"
              value={selectedPlan}
              onChange={(value) => setSelectedPlan(value)}
            >
              <Option value="1">Free Plan</Option>
              <Option value="2">Paid Plan</Option>
              <Option value="3">Concierge Service Plan</Option>
            </Select>
          </Form.Item>

          {/* Only show the other fields if a plan is selected */}
          {selectedPlan && !fetchingSettings && (
            <>
              <Form.Item label="Frequency" name="frequency">
                <Select placeholder="Select frequency">
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Number of Rows" name="rows">
                <Input placeholder="Enter number of rows" />
              </Form.Item>

              <Form.Item name="sendLinks" valuePropName="checked">
                <Checkbox>Send Links</Checkbox>
              </Form.Item>

              <Form.Item label="Associated Websites" name="websites">
                <Select mode="multiple" placeholder="Select websites">
                  {_websites.map((website) => (
                    <Option key={website._id} value={website._id}>
                      {website.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

export default NotificationsSettingModal;
