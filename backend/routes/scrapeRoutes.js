const express = require('express');
const router = express.Router();
const scrapeController = require('../controllers/scrapeController');


router.get('/count', scrapeController.getUrlsCount);
router.get('/scrape/count', scrapeController.getScrapeDataCount);

router.get('/:webId', scrapeController.getUrls);

// Add url
router.post('/:webId', scrapeController.addUrl);

// Update or delete urls
router.put('/:urlId', scrapeController.updateUrl);
router.delete('/:urlId', scrapeController.deleteUrl);

// Scrape data based on a URL
router.get('/scrape/:urlId', scrapeController.getScrapedData);
router.post('/scrape/:urlId', scrapeController.scrapeData);
router.delete('/scrape/:urlId', scrapeController.deleteScrapeData);

// More routes for updating, deleting, re-scraping URLs can be added here
module.exports = router;