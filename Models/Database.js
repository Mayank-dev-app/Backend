const mongosh = require('mongoose');

//Create UserScheema
const userScheema = new mongosh.Schema({
    name: {
        type:String,
    },
    username:{
      type:String,
      unique:true,
    },
    email:{
        type:String,
        unique: true,
    },
    password:{
        type:String,
    },
    verifyCode:{
        type: String,
    },
    isverified:{
        type:Boolean,
        default:false,
    },
    expire:{
        type: String,
    },
},{timestamps: true});

//Create a mongoscheema Model
const user = mongosh.model('user',userScheema);

//Export user 
module.exports = user;