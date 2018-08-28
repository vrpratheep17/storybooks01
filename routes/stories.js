const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { ensureAuthenticated } = require("../helpers/auth");

//bringing stories model in
const Story = mongoose.model("stories");
const User = mongoose.model("users");
//stories index
router.get("/", (req, res) => {
  Story.find({
    status: "public"
  })
    .populate("user")
    .sort({ date: "desc" })
    .then(stories => {
      res.render("stories/index", {
        stories: stories
      });
    });
});

//edit stories
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
    .populate("user")
    .then(story => {
      if (story.user.id != req.user.id) {
        res.redirect("/stories");
      } else {
        res.render("stories/edit", {
          story: story
        });
      }
    });
});

//show specfic user stories
router.get("/user/:userId", (req, res) => {
  Story.find({ user: req.params.userId, status: "public" })
    .populate("user")
    .then(stories => {
      res.render("stories/index", {
        stories: stories
      });
    });
});
router.get("/show/:id", (req, res) => {
  Story.findOne({
    _id: req.params.id
  })
    .populate("user")
    .populate("comments.commentUser")
    .then(story => {
      if (story.status == "public") {
        res.render("stories/show", {
          story: story
        });
      } else {
        if (req.user) {
          if (req.user.id == story.user._id) {
            res.render("stories/show", {
              story: story
            });
          } else {
            res.redirect("/stories");
          }
        } else {
          res.redirect("/stories");
        }
      }
    });
});
//add story
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("stories/add");
});
//DELETE stories
router.delete("/:id", (req, res) => {
  Story.remove({
    _id: req.params.id
  }).then(story => {
    res.redirect("/dashboard");
  });
});
//put
router.put("/:id", (req, res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    let allowComments;
    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }

    story.title = req.body.title;
    story.body = req.body.title;
    story.allowComments = allowComments;
    story.status = req.body.status;
    story.save().then(story => {
      res.redirect("/dashboard");
    });
  });
});
//post comment
router.post("/comment/:id", (req, res) => {
  Story.findOne({
    _id: req.params.id
  }).then(story => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    };
    story.comments.unshift(newComment);
    story.save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
  });
});
//post stories
router.post("/", (req, res) => {
  let allowComments;
  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }
  const newStory = {
    title: req.body.title,
    status: req.body.status,
    allowComments: allowComments,
    body: req.body.body,
    user: req.user.id
  };

  new Story(newStory).save().then(story => {
    res.redirect("/dashboard");
  });
});
module.exports = router;
