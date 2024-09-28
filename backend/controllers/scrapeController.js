const scrapeService = require("../services/scrapeService");

exports.getUrlsCount = async (req, res) => {
  try {
    const counts = await scrapeService.getUrlsCount();

    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getScrapeDataCount = async (req, res) => {
  try {
    const counts = await scrapeService.getScrapeDataCount();
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUrls = async (req, res) => {
  try {
    const websiteId = req.params.webId; // Get websiteId from query parameters
    const { page = 1, limit = 30, filter = "" } = req.query; // Get pagination and filter params

    const urls = await scrapeService.getAllUrls(websiteId, {
      page: parseInt(page),
      limit: parseInt(limit),
      filter,
    });

    res.json(urls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addUrl = async (req, res) => {
  try {
    const newUrl = await scrapeService.addUrl(req.params.webId, req.body);
    res.json(newUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUrl = async (req, res) => {
  try {
    const updatedUrl = await scrapeService.updateUrl(
      req.params.urlId,
      req.body
    );
    res.json(updatedUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUrl = async (req, res) => {
  try {
    await scrapeService.deleteUrl(req.params.urlId);
    res.json({ message: "Url deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getScrapedData = async (req, res) => {
    try {
        const urlId = req.params.urlId; // Get websiteId from query parameters
        const { page = 1, limit = 30 } = req.query; // Get pagination and filter params
    
        const scrapedData = await scrapeService.getScrapedData(urlId, {
          page: parseInt(page),
          limit: parseInt(limit)
        });
    
        res.json(scrapedData);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};

exports.scrapeData = async (req, res) => {
  try {
      const urlId = req.params.urlId;
      await scrapeService.scrapeData(urlId)
  
      res.json({ message: "Data successfully scraped and saved!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

exports.deleteScrapeData = async (req, res) => {
  try {
    await scrapeService.deleteScrapeData(req.params.urlId);
    res.json({ message: "Data deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
