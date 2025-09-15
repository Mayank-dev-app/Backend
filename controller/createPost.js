const Post = require("../Models/Post");

const CreatePost = async (req, res) => {
  try {
    const { Photo, Body } = req.body;
    if (!Photo || !Body) {
      return res.status(400).send({
        success: false,
        message: "Please Fill All Fileds",
      });
    }

    const CreatPost = await Post.create({
      Photo,
      Body,
      PostedBy: req.user,
    });

    return res.status(201).send({
      success: true,
      message: "Post Created Successfully",
      CreatPost,
    });
  } catch (error) {
    console.log("The Error is: ", error);
    return res.status(500).send({
      success: false,
      message: "Server Error - Creat Post",
    });
  }
};

//Show Profile Post
const showmyPost = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find posts created by the user
    const posts = await Post.find({ PostedBy: userId })
      .populate("PostedBy", "name _id")
      .populate("Comments.postedBy", "name  _id") // For each comment's author
      .sort({ createdAt: -1 }); // Optional: newest first; // or { createdBy: userId }

    return res.status(200).send({
      success: true,
      message: "Your Posts",
      data: posts,
    });
  } catch (error) {
    console.log("The Error is: ", error);
    return res.status(500).send({
      success: false,
      message: "Server Error - ShowPost",
    });
  }
};

// Like Method
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    const index = post.Likes.indexOf(userId);
    if (index === -1) {
      post.Likes.push(userId);
    } else {
      post.Likes.splice(index, 1);
    }

    await post.save();
    res.status(200).json({ success: true, likedBy: post.Likes });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error - like Server" });
  }
};

const sendComment = async (req, res) => {
  try {
    const { postId, comment } = req.body;
    const userId = req.user._id;

  console.log(userId);
    if (!postId || !comment) {
      return res.status(400).json({
        success: false,
        message: "Post ID and comment are required",
      });
    }

    // 👇 Comment push
    await Post.findByIdAndUpdate(postId, {
      $push: {
        Comments: {
          comment,
          postedBy: userId,
        },
      },
    });

    // ✅ Fetch updated post with populated PostedBy inside Comments
    const updatedPost = await Post.findById(postId)
      .populate("Comments.postedBy", "name  _id") // ensure this path is correct
      .populate("PostedBy", "name  _id");

    // ✅ Get the last comment (recent one)
    const lastComment = updatedPost.Comments[updatedPost.Comments.length - 1];

    console.log(
      "POPULATED COMMENTS ====>",
      JSON.stringify(updatedPost.Comments, null, 2)
    );

    res.status(200).json({
      success: true,
      message: "Comment added",
      newComment: lastComment,
    });
  } catch (err) {
    console.error("sendComment error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error - Comment Server",
    });
  }
};


//Show All Posts
const showAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("PostedBy", "name _id")
      .populate("Comments.postedBy", "name _id")
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message: "All Posts Fetched",
      data: posts,
    });
  } catch (error) {
    console.log("The Error is: ", error);
    return res.status(500).send({
      success: false,
      message: "Server Error - All Posts",
    });
  }
};


module.exports = { CreatePost, showmyPost, likePost, sendComment, showAllPosts };
