const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();

const commentsByPostId = {};

process.on("unhandledRejection", (reason, promise) => {
  require("fs").writeFileSync(
    "./1.json",
    JSON.stringify({ ...reason }),
    { encoding: "utf-8" }
  );
});

app.use(express.json());
app.use(cors());

app.get("/posts/:id/comments", (req, res) => {
  res.status(201).send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];
  comments.push({ id: commentId, content, status: "pending" });
  commentsByPostId[req.params.id] = comments;

  await axios.post("http://event-bus-srv:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: "pending",
    },
  });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  console.log("received event", req.body.type);

  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];

    const comment = comments.find((comment) => comment.id === id);
    comment.status = status;

    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        status,
        postId,
        content,
      },
    });
  }

  return res.send({}).end();
});

app.listen(4001, () => {
  console.log("1. Comments server started at 4001");
});
