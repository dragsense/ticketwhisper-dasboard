const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
    websiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Website' },
    name: String,
    url: String,
    pageLimit: Number,
    nextPageSelector: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Url', UrlSchema);