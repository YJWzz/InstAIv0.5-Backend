const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require("dotenv");
const multer = require('multer');
const fs = require('fs');
const app = express();

const mysql = require("./src/sql.js");
const router = require("./router");
const page = require("./router/page.js");
const uploadRouter = require('./router');
dotenv.config()

app.use(express.json())
app.use(cors())
app.use(router)
app.use(page)
app.use(uploadRouter);
app.use(express.static("./build"))
app.use(express.static("./UserUploadFolder"))
// app.use('/static', express.static(path.join(__dirname, '../UserUploadFolder')));
/*app.use('/', express.static(path.join(__dirname, 'UserUploadFolder')));//不知道啥用*/
const port = 8080
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// 設定 Multer
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });
  
  
  
  
