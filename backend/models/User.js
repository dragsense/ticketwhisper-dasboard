const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    name: String,
    whatsappNumber: String,
    email: String,
    instagramID: String,
    preferredPlan: { type: Number, enum: [1, 2, 3] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);