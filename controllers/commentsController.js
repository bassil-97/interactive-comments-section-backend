const mongoose = require("mongoose");
const moment = require("moment");

const HttpError = require("../models/http-error");
const Comment = require("../models/comment");

// Get All Comments

const getAllComments = async (req, res, next) => {
  Comment.find({ postId: "1" })
    .sort({ postedDate: 1 })
    .lean()
    .exec()
    .then((comments) => {
      let rec = (comment, threads) => {
        for (var thread in threads) {
          value = threads[thread];

          if (thread.toString() === comment.parentId.toString()) {
            value.children[comment._id] = comment;
            return;
          }

          if (value.children) {
            rec(comment, value.children);
          }
        }
      };
      let threads = {},
        comment;
      for (let i = 0; i < comments.length; i++) {
        comment = comments[i];
        comment["children"] = {};
        let parentId = comment.parentId;
        if (!parentId) {
          threads[comment._id] = comment;
          continue;
        }
        rec(comment, threads);
      }

      res.json({
        comments: threads,
      });
    })
    .catch((err) => res.status(500).json({ error: err }));

  // let comments;

  // try {
  //   comments = await Comment.find({});
  // } catch (err) {
  //   const error = new HttpError(
  //     "Fetching comments failed, please try again later.",
  //     500
  //   );
  //   return next(error);
  // }

  // res.json({
  //   comments: comments.map((comment) => comment.toObject({ getters: true })),
  // });
};

// Add New Comment

const addComment = async (req, res, next) => {
  let data = {
    author: {
      id: req.body.id,
      name: req.body.name,
    },
    commentText: req.body.commentText,
  };

  if ("parentId" in req.body) {
    data.parentId = req.body.parentId;
  }

  if ("depth" in req.body) {
    data.depth = req.body.depth;
  }

  const comment = new Comment({
    ...data,
    createdAt: moment().format("MMMM Do YYYY"),
    votes: 0,
  });

  try {
    await comment.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating comment failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({ comment: comment, commentAdded: true });
  // const { username, commentText } = req.body;

  // const createdComment = new Comment({
  //   username,
  //   commentText,
  //   createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
  //   votes: 0,
  //   replays: [],
  // });

  // try {
  //   await createdComment.save();
  // } catch (err) {
  //   const error = new HttpError(
  //     "Creating comment failed, please try again later.",
  //     500
  //   );
  //   return next(error);
  // }

  // res.status(201).json({ comment: createdComment, commentAdded: true });
};

// change Comment Votes

const changeCommentVotes = async (req, res, next) => {
  let { actionType } = req.body;
  let commentId = req.params.commentId,
    comment;

  try {
    comment = await Comment.findById(commentId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find comment.",
      500
    );
    return next(error);
  }

  if (actionType === "increase") comment.votes += 1;
  else comment.votes -= 1;

  if (comment.votes < 0) comment.votes = 0;

  try {
    await comment.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update comment votes.",
      500
    );
    return next(error);
  }

  res.status(200).json({ comment: comment.toObject({ getters: true }) });
};

const addReplayToComment = async (req, res, next) => {
  const { username, commentText } = req.body;
  let commentId = req.params.commentId,
    comment;

  try {
    comment = await Comment.findById(commentId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find comment.",
      500
    );
    return next(error);
  }

  comment.replays.push({
    username,
    commentText,
    createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
    votes: 0,
  });

  try {
    await comment.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update comment replays.",
      500
    );
    return next(error);
  }

  res.status(200).json({ comment: comment.toObject({ getters: true }) });
};

// Delete Comment

const deleteComment = async (req, res, next) => {
  let commentId = req.params.commentId;
  let comment;

  try {
    comment = await Comment.findById(commentId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, Could not find comment with the given ID.",
      500
    );
    return next(error);
  }

  if (comment) {
    try {
      await comment.remove();
    } catch (err) {
      const error = new HttpError(
        "Something went wrong, could not delete comment.",
        500
      );
      return next(error);
    }
  }

  res.status(200).json({ message: "Comment Removed", commentRemoved: true });
};

exports.getAllComments = getAllComments;
exports.addComment = addComment;
exports.changeCommentVotes = changeCommentVotes;
exports.addReplayToComment = addReplayToComment;
exports.deleteComment = deleteComment;
