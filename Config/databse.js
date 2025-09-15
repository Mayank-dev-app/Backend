const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config()

//Define MongoDB URL
const mongURL = process.env.DataBASE;

//Set Up MongoDb Connection
mongoose.connect(mongURL);

//Get the Default Connection
const db = mongoose.connection;

//Define event listener for mongoDb Connection

db.on('connected', ()=>{
    console.log("MongoDb is successfull Connected");
})


db.on('error', (err)=>{
    console.log("The Database Connection have some error");
})

db.on('disconneted', ()=>{
    console.log("the Database is disconnected");
})

module.exports = db;