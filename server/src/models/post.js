const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idAccount: String,
        createDate: Date,
});

const ReplySchema = new Schema({
        id: mongoose.Types.ObjectId,
        idAccount: String,
        content: String,
        like: [LikeSchema],
        image: { type: String, default: null },
        createDate: Date,
});

const CommentSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idAccount: String,
        content: String,
        like: [LikeSchema],
        image: { type: String, default: null },
        createDate: Date,
        reply: [ReplySchema],
});

const PostSchema = new Schema({
        id: mongoose.Types.ObjectId,
        idAccount: String,
        idRestaurant: { type: String, default: null },
        content: String,
        like: [LikeSchema],
        comment: [CommentSchema],
        image: [String],
        createDate: Date,
        typePost: { type: String, default: 'client' },
        discount: { type: String, default: null },
        viewRestaurant: { type: Number, default: 0 }
});

module.exports = mongoose.model('posts', PostSchema);
