const express = require("express");

const commentsController = require("../controllers/commentsController");

const router = express.Router();

router.get("/", commentsController.getAllComments);

router.post("/add-new-comment", commentsController.addComment);

router.patch(
  "/change-comment-votes/:commentId",
  commentsController.changeCommentVotes
);

router.patch(
  "/add-replay-to-comment/:commentId",
  commentsController.addReplayToComment
);

router.delete("/delete-comment/:commentId", commentsController.deleteComment);

module.exports = router;
