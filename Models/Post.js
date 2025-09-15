const moongosh = require("mongoose");
const PostScheema = moongosh.Schema(
  {
    Body: {
      type: String,
      required: true, // ✅ spelling fixed
    },
    Photo: {
      type: String,
      required: true, // ✅ spelling fixed
    },
    Likes: {
      type: [moongosh.Schema.Types.ObjectId], // <-- ARRAY OF IDs
      ref: "user",
      default: [],
    },

    Comments: [
      {
        comment: { type: String , required: true,},
        postedBy: { type: moongosh.Schema.Types.ObjectId, ref: "user" },
      },
    ],
    
    PostedBy: {
      type: moongosh.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

//Create a mongoscheema Model
const Post = moongosh.model("Post", PostScheema);

module.exports = Post;
