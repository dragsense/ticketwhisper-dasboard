const mongoose = require('mongoose');

const WebsiteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    scrapFields: [{
        selector: String,
        fieldTitle: String,
        contentType: String
    }],
    wrapperSelector: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Website', WebsiteSchema);