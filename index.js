const express = require('express');
require('./Config/databse');
const dotenv = require("dotenv");
dotenv.config()
const cors = require('cors');
const app = express();


const corsOption = {
   origin: "http://localhost:5173",
   method: ["GET", "POST"]
};

app.use(cors(corsOption));
app.use(express.json());
app.use('/', require('./Router/AuthorizeUser'));
app.use("/api/v1/", require("./Router/CreatePost"));

const PORT = 8000;
app.listen(PORT, ()=> console.log(`The Port is Running on ${PORT}`));