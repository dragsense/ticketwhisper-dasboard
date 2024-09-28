const mongoose = require('mongoose');

const ScrapeDataSchema = new mongoose.Schema({
    urlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Url' },
    data: mongoose.Schema.Types.Mixed,  // Dynamic fields based on website classes
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScrapeData', ScrapeDataSchema);