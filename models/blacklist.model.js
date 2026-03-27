const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => Date.now() + 1 * 24 * 60 * 60 * 1000, // 1 day 
    }
}, { timestamps: true });

blacklistSchema.index({ token: 1 }, { unique: true });
//for time based automatic deletion
blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Blacklist = mongoose.model('blacklist', blacklistSchema);
module.exports = Blacklist;