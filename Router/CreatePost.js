const express = require("express");
const { CreatePost, showmyPost, likePost, sendComment, showAllPosts } = require("../controller/createPost");
const { jwtauthmiddleware } = require("../jwt/jwt");
const Router = express.Router();

const Post = require("../Models/Post");
const { JsonWebTokenError } = require("jsonwebtoken");

//Show all Post
Router.get("/all-post",jwtauthmiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("PostedBy", "name id")  // Only populate name and id of the user
      .exec();

    return res.status(200).json({
      success: true,
      message: "All posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    console.log("The Error is: ", error);
    return res.status(500).json({
      success: false,
      message: 'Server Error - All Post',
    });
  }
});

//Show user Post
Router.get("/profile",jwtauthmiddleware, showmyPost );

Router.post("/create-post",jwtauthmiddleware, CreatePost);

Router.put("/like-post/:postId",jwtauthmiddleware,likePost );

Router.post("/comment", jwtauthmiddleware,sendComment );

Router.get("/showAllPosts", jwtauthmiddleware, showAllPosts);
module.exports = Router;