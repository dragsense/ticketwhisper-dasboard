const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');

router.get('/count', websiteController.getWebsitesCount);
router.get('/', websiteController.getWebsites);

// Add website
router.post('/', websiteController.addWebsite);

// Update or delete websites
router.put('/:websiteId', websiteController.updateWebsite);
router.delete('/:websiteId', websiteController.deleteWebsite);

module.exports = router;