const Website = require("../models/Website");

exports.getWebsitesCount = async () => {
  const count = await Website.countDocuments();

  return {
    count,
  };
};

exports.getAllWebsites = async ({ page, limit, filter }) => {
  const query = {};

  // Add filtering if a filter is provided
  if (filter) {
    query.$or = [
      { name: { $regex: filter, $options: "i" } },
      // Add other fields to filter on as needed
    ];
  }

  // Fetch websites with pagination
  const websites = await Website.find(query)
    .skip((page - 1) * limit) // Skip the appropriate number of records
    .limit(limit); // Limit the number of records returned

  // Optionally, get total count for pagination
  const total = await Website.countDocuments(query);

  return { websites, total }; // Return websites along with total count
};

exports.addWebsite = async (websiteData) => {
  const existingWebsite = await Website.findOne({
    $or: [{ name: websiteData.name }, { url: websiteData.url }], // Check for either name or url
  });

  if (existingWebsite) {
    throw new Error("This Website URL or name has already been added."); // Throw an error if it exists
  }

  const website = new Website(websiteData);
  return await website.save();
};

exports.updateWebsite = async (websiteId, updateData) => {

  const existingWebsite = await Website.findOne({
    _id: { $ne: websiteId }, 
    $or: [{ name: updateData.name }, { url: updateData.url }] 
  });

  if (existingWebsite) {
    throw new Error("Another Website URL or name with the same value already exists."); 
  }

  return await Website.findByIdAndUpdate(websiteId, updateData, { new: true });
};

exports.deleteWebsite = async (websiteId) => {
  return await Website.findByIdAndDelete(websiteId);
};
