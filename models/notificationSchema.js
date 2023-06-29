const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    email: { type: String, require: true },
    mediaID: { type: String, require: true },
    mediaType: { type: String, require: true },
    language: { type: String, require: true },
    createdAt: { type: Date, require: true }
});

const model = mongoose.model('NotificationModels', notificationSchema);

module.exports = model;