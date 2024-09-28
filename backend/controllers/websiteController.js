const websiteService = require("../services/websiteService");

exports.getWebsitesCount = async (req, res) => {
  try {
    const counts = await websiteService.getWebsitesCount();

    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWebsites = async (req, res) => {
  try {
      const { page = 1, limit = 30, filter = "" } = req.query; // Get pagination and filter params

      const websites = await websiteService.getAllWebsites({
          page: parseInt(page),
          limit: parseInt(limit),
          filter,
      });

      res.json(websites);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};


exports.addWebsite = async (req, res) => {
  try {
      const newWebsite = await websiteService.addWebsite(req.body);
      res.json(newWebsite);
  } catch (err) {

      res.status(500).json({ error: err.message });
  }
};

exports.updateWebsite = async (req, res) => {
  try {
      const updatedWebsite = await websiteService.updateWebsite(req.params.websiteId, req.body);
      res.json(updatedWebsite);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

exports.deleteWebsite = async (req, res) => {
  try {
      await websiteService.deleteWebsite(req.params.websiteId);
      res.json({ message: 'Website deleted successfully' });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
}; 