const NotificationsSetting = require("../models/NotificationsSetting");
const User = require("../models/User");

exports.getUsersCount = async () => {
  const result = await User.aggregate([
    {
      $group: {
        _id: "$preferredPlan",
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    freeCount: result.find((r) => r._id === 1)?.count || 0,
    paidCount: result.find((r) => r._id === 2)?.count || 0,
    conciergeCount: result.find((r) => r._id === 3)?.count || 0,
  };
};

exports.getAllUsers = async ({ page, pageSize, filters }) => {
  const { name, whatsappNumber, preferredPlan } = filters;

  // Build query based on filters
  const query = {};
  if (name) {
    query.name = { $regex: name, $options: "i" }; // Case-insensitive search
  }
  if (whatsappNumber) {
    query.whatsappNumber = { $regex: whatsappNumber, $options: "i" };
  }
  if (preferredPlan) {
    query.preferredPlan = preferredPlan;
  }

  // Fetch users from the database with pagination
  const users = await User.find(query)
    .skip((page - 1) * pageSize) // Calculate the number of documents to skip
    .limit(pageSize); // Limit the number of results returned

  // Optionally, get the total count of users for pagination
  const total = await User.countDocuments(query);

  return { users, total }; // Return users along with total count
};

exports.addUser = async (userData) => {

  const existingUser = await User.findOne({ whatsappNumber: userData.whatsappNumber });

  if (existingUser) {
    throw new Error("A user with this WhatsApp number already exists."); // Throw an error if it exists
  }

  const user = new User(userData);
  return await user.save();
};

exports.updateUser = async (userId, updateData) => {

  const existingUser = await User.findOne({
    _id: { $ne: userId }, 
    whatsappNumber: updateData.whatsappNumber, 
  });

  if (existingUser) {
    throw new Error("A user with this WhatsApp number already exists."); 
  }

  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

exports.getNotificationsSetting = async (preferredPlan) => {
  return await NotificationsSetting.findOne({ preferredPlan });
};
exports.updateNotificationsSetting = async (preferredPlan, updateData) => {
  return await NotificationsSetting.findOneAndUpdate(
    { preferredPlan },
    updateData,
    {
      upsert: true, 
      setDefaultsOnInsert: true,
    }
  );
};

exports.deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};
