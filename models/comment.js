const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    postId: { type: Number, default: 1 },
    depth: {
      type: Number,
      default: 1,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    author: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
    commentText: { type: String, required: true },
    createdAt: { type: String, required: true },
    votes: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
