const mongoose = require('mongoose');
const { boolean } = require('webidl-conversions');

const UrlSchema = new mongoose.Schema({
    websiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Website' },
    name: String,
    url: String,
    pageLimit: Number,
    isOnScroll: Boolean,
    nextPageSelector: String,
    popupCloseSelector: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Url', UrlSchema);