const puppeteerScraper = require("../scrapers/puppeteerScraper");
const ScrapeData = require("../models/ScrapeData");
const Url = require("../models/Url");

exports.getUrlsCount = async () => {
  const count = await Url.countDocuments();

  return {
    count,
  };
};

exports.getScrapeDataCount = async () => {
  const count = await ScrapeData.countDocuments();

  return {
    count,
  };
};

exports.getAllUrls = async (websiteId, { page, limit, filter }) => {
  const query = { websiteId };

  // Add filtering if a filter is provided
  if (filter) {
    query.$or = [
      { name: { $regex: filter, $options: "i" } }, // Example filter on url field
      // Add other fields to filter on as needed
    ];
  }

  // Fetch urls with pagination
  const urls = await Url.find(query)
    .skip((page - 1) * limit) // Skip the appropriate number of records
    .limit(limit); // Limit the number of records returned

  // Optionally, get total count for pagination
  const total = await Url.countDocuments(query);

  return { urls, total }; // Return urls along with total count
};

exports.addUrl = async (websiteId, urlData) => {

  const existingUrl = await Url.findOne({ 
    websiteId, 
    $or: [{ name: urlData.name }, { url: urlData.url }] // Check for either name or url
  });

  if (existingUrl) {
    throw new Error("This URL or name has already been added."); // Throw an error if it exists
  }

  const url = new Url({ websiteId, ...urlData });
  return await url.save();
};

exports.updateUrl = async (urlId, updateData) => {

  const existingUrl = await Url.findOne({
    _id: { $ne: urlId }, 
    $or: [{ name: updateData.name }, { url: updateData.url }] 
  });

  if (existingUrl) {
    throw new Error("Another URL or name with the same value already exists."); 
  }

  return await Url.findByIdAndUpdate(urlId, updateData, { new: true });
};

exports.deleteUrl = async (urlId) => {
  await ScrapeData.deleteMany({ urlId });
  return await Url.findByIdAndDelete(urlId);
};

exports.getScrapedData = async (urlId, { page, limit }) => {
  const query = { urlId };

  // Fetch urls with pagination
  const data = await ScrapeData.find(query)
    .skip((page - 1) * limit) // Skip the appropriate number of records
    .limit(limit); // Limit the number of records returned

  // Optionally, get total count for pagination
  const total = await ScrapeData.countDocuments(query);


  return { data, total }; // Return urls along with total count
};

exports.deleteScrapeData = async (urlId) => {
  return await ScrapeData.deleteMany({ urlId });
};

exports.scrapeData = async (urlId) => {
  const url = await Url.findById(urlId).populate("websiteId");
  if (!url) throw new Error("URL not found");
  
  await ScrapeData.deleteMany({ urlId });

  await puppeteerScraper.scrape(url);

};
