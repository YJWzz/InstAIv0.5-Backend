var express = require('express');
var router = express.Router();
const pool = require("../src/sql.js");
const path = require("path");
const multer = require('multer');
const fs = require('fs');
const { log } = require('console');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(`./UserUploadFolder/${req.query.folder}`));
  },
  filename: function (req, file, cb) {
    cb(null,file.originalname);// Date.now() + path.extname(file.originalname)
  }
});
const upload = multer({ storage });

//line的function
const mysql = require('mysql2');
const axios = require('axios'); 
const line = require('@line/bot-sdk');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');

const cors = require('cors');
const { middleware: lineMiddleware } = require('@line/bot-sdk');

const { text } = require('body-parser');
const { Server } = require('http');
const { checkPrimeSync } = require('crypto');

require('dotenv').config();

const app = express();
const server = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')));
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8082 });

//新增使用者資訊到login table
router.post('/signup', (req, res) => {
  const confirmQuery = "SELECT * FROM users WHERE email = ?";
  const insertQuery = "INSERT INTO users (email, fname, lname, password) VALUES (?, ?, ?, ?)";

  const values = [
    req.body.email,
    req.body.fname,
    req.body.lname,
    req.body.password
  ];

  const decodedToken = jwt.decode(values[3]);
  // console.log(`decodedToken: ${decodedToken}`)

  // 檢查是否已經存在相同的 email
  db.query(confirmQuery, [req.body.email], (err, confirmData) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ status: "Error", message: "System error" });
    }

    if (confirmData.length > 0) { 
      // console.log(confirmData)
      return res.status(200).json({ status: "Success", message: "Email already exists" });
    } else {
      // 插入新的使用者
      db.query(insertQuery, values, (err, data) => {
        console.log(data)
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ status: "Error", message: "System error" });
        }

        return res.status(201).json({ status: "Success", message: "User created successfully", userId: data.insertId});
      });
    }
  });
//   console.log(req.body);

//   //資料庫註冊
//   pool.query(`insert into login (fname, lname, email, password) values ('${req.body.fname}','${req.body.lname}','${req.body.email}','${req.body.password}');`)
//   res.send(200);
});

// //登入資料核對
router.post('/signin', async (req, res) => {
  const sql = "SELECT * FROM users WHERE `email` = (?) AND `password` = (?)"
  const values = [
    req.body.email,
    req.body.password
  ]
  db.query(sql, [values[0], values[1]], (err, data) => {  //查詢登入資訊是否正確
    // console.log(data[0].line_id)
    if (err) return res.status(500).json({ status: "Error", message: "System error" });

    if (data.length > 0) {
      if (data[0].line_id === null) {
        console.log('User found:', data[0].fname + data[0].lname);
        
        return res.status(200).json({
          status: "Success",
          message: "User login successfully, but line_id is null",
          data:data
        });
        
      } else {
        // res.send(`Success: ${data.fname} ${data.lname}`);
        return res.status(201).json({
          status: "Success",
          message: "User login successfully",
          data:data
        });
      }
    } else {
      return res.status(400).json({
        status: "Failed",
        message: "User not exist"
        
      });
    }
  })
//   const email = req.body.email;
//   const password = req.body.password;
//   console.log(req.body);
//   const query = 'SELECT * FROM login WHERE email = ?';

//   pool.query(query, [email], (err, results) => {
//     if (err) {
//       console.error(err);
//       // 處理錯誤
//       return;
//     }

//     // results 包含查詢結果的陣列
//     const rows = results[0];
//     console.log(rows);
//     console.log(rows.email);

//     if (rows.email === email && rows.password === password) { //驗證前端傳到後端的帳號密碼是否有存在於資料庫
//       // 找到符合條件的使用者
//       console.log('User found:', rows.fname + rows.lname);
//       res.send("Success" + rows.fname + rows.lname);

//     } else {
//       // 沒有符合條件的使用者
//       console.log('User not found');
//       res.send("errr");
//     }
//   });
  }
);

//將創建資料夾的資訊存入資料庫
router.post('/WCreateFolder', (req, res) => {
  console.log(req.body)

  // if (req.body.token.includes("Success")) {
    const user = req.body.token.slice(7);//取得Success後面的字串 slice(輸入取用的第幾位之後)
    console.log(user)
    pool.query(`insert into CreateFolder (user, folder_name, uploadtime) values ('${user}','${req.body.data.folder_name}','${String(req.body.data.uploadtime)}');`)
    return res.sendStatus(200);
  // }
  // res.sendStatus(403);
});

//創建使用者上傳檔案之資料夾
router.post('/CreateFolder', (req, res) => {
  const folderName = req.body.data.folder_name
  console.log(req.body)
  // 動態生成資料夾路徑
  const folderPath = path.join(__dirname, '..', 'UserUploadFolder', folderName);

  // 如果資料夾不存在，則建立
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(folderName)
    return res.send('Success' + folderName);
  }

  res.send('fail   ');
});

//刪除使用者上傳檔案之資料夾
router.delete('/DeleteFolder/:folder_name', (req, res) => {

  const folderName = req.params.folder_name;

  pool.query(`DELETE FROM Project WHERE folder = '${folderName}'`, (err, result) => {
    if (err) {
      console.error('Error deleting database record:', err);
      return res.status(500).send('Error deleting database record');
    }
  })

  pool.query(`DELETE FROM CreateFolder WHERE folder_name = '${folderName}'`, (err, result) => {
    if (err) {
      console.error('Error deleting database record:', err);
      return res.status(500).send('Error deleting database record');
    }
  })

  // 動態生成資料夾路徑
  const folderPath = path.join(__dirname, '..', 'UserUploadFolder', folderName);


  if (fs.existsSync(folderPath)) {
    // 使用 fs.rmdirSync 刪除資料夾
    fs.rmdirSync(folderPath, { recursive: true });

    return res.send('Success');
  }

  res.send("can't find");
});

//使用者上傳檔案至後端及資料庫
router.post('/upload', upload.single('image'), (req, res) => {
  const user = req.query.user
  const folder = req.query.folder
  const project_name = req.query.project_name
  const upload_time = req.query.upload_time
  const folderPath = path.join(__dirname, '../UserUploadFolder', folder);

  pool.query(`insert into Project (user, folder, project_name, project_path, upload_time) values ('${user}', '${folder}', '${project_name}', '${folderPath}', '${String(upload_time)}');`)
  res.sendStatus(200);
});


//獲取有哪些資料夾
router.get('/WCreateFolder', (req, res) => {
  // SQL 查詢語句，檢索所需的列
  const query = 'SELECT id, folder_name FROM CreateFolder';

  // 執行 SQL 查詢
  pool.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error executing query: ', error);
      res.status(500).json({ error: 'An error occurred while fetching data' });
      return;
    }

    // 將檢索到的資料返回給前端
    res.json(results);
  });
});

//requirement
router.post('/Requirement', (req, res) => {

  const user = req.body.inform.Username
  const time = req.body.inform.uploadtime
  const jsonData = JSON.stringify(req.body.data, null, 2);


  const fileName = 'requirement.json'
  //const filePath = path.join(__dirname, '../UserUploadFolder', fileName); //
  const filePath = `${__dirname}/../UserUploadFolder/${req.body.inform.folder_name}/${fileName}`;
  console.log(filePath)
  console.log(jsonData)

  fs.writeFile(filePath, jsonData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing JSON file:', err);
    } else {
      console.log('JSON file saved successfully!');
      console.log(req.body.inform);
    }
  });
  pool.query(`insert into Requirement (requirement_path, author, uploadtime) values ('${filePath}', '${user}', '${String(time)}');`)
});

/*
//抓取圖片(????)
router.get('/Download', (req, res) => {

});
*/

//checkdata(抓有哪些圖片)
router.get('/upload/:folder_name', (req, res) => {

  const folderName = req.params.folder_name
  const folderPath = path.join(__dirname, '../UserUploadFolder/', folderName);
  /*
    1. 前端打 upload folder_name
    2. 後端收到資訊 回傳 每張圖片的api(url)字串 (回傳array)
    3. 後端把每張圖片都開一個API
    4. 前端收到URL array 無腦打API
    5. 收到所有圖片
  */

  // 检查文件夹是否存在
  if (fs.existsSync(folderPath)) {
    // 读取文件夹中的文件列表
    fs.readdir(folderPath, async (err, files) => {
      if (err) {
        console.error('Error reading folder:', err);
        return res.status(500).json({ error: 'Error reading folder' });
      }

      // 过滤出.jpg文件
      const photoPaths = files.filter(file => file.endsWith('.jpg'))
        .map(file => `http://localhost:8080/photo?folderName=${folderName}&file=${file}`);

      // .map(file => `/static/${folderName}/${file}`);

      // 将文件路径数组作为响应发送给前端
      res.send(photoPaths);
    });
  } else {
    res.status(404).json({ error: 'Folder not found' });
  }

});


router.get('/photo/', (req, res) => {
  // `http://localhost:8080/photo?folderName=${folderName}&file=${file}`
  res.sendFile(path.join(__dirname, '../UserUploadFolder', req.query.folderName, req.query.file))
})

//刪除圖片
router.delete(`/DeleteItem/:folder_name/:fileName`, (req, res) => {
  const project_name = req.params.fileName;
  const folder = req.params.folder_name;
  const folderPath = path.join(__dirname, '../UserUploadFolder/', folder);
  const fileName = project_name; // 要刪除的圖片檔名，包括副檔名
  const imagePath = path.join(folderPath, fileName); // 圖片完整路徑
  // 檢查圖片是否存在
  if (fs.existsSync(imagePath)) {
    // 刪除圖片
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting image:', err);
        return res.status(500).send('Error deleting image');
      } else {
        console.log('Image deleted successfully!');
        // 繼續刪除資料庫記錄
        pool.query(`DELETE FROM Project WHERE folder = '${folder}' AND project_name = '${project_name}'`, (err, result) => {
          if (err) {
            console.error('Error deleting database record:', err);
            return res.status(500).send('Error deleting database record');
          }
          // 成功刪除資料庫記錄後，向客戶端發送成功狀態碼
          res.status(200).send('Image and database record deleted successfully');
        });
      }
    });
  } else {
    console.log('Image does not exist.');
    // 如果圖片不存在，僅刪除資料庫記錄並向客戶端發送成功狀態碼
    pool.query(`DELETE FROM Project WHERE folder = '${folder}' AND project_name = '${project_name}'`, (err, result) => {
      if (err) {
        console.error('Error deleting database record:', err);
        return res.status(500).send('Error deleting database record');
      }
      // 成功刪除資料庫記錄後，向客戶端發送成功狀態碼
      res.status(200).send('Database record deleted successfully');
    });
  }
});

//get指定資料夾內的requirement.json
router.get('/RequirementJson/:folder_name', (req, res) => {
  const folderName = req.params.folder_name;

  const folderPath = `${__dirname}/../UserUploadFolder/${folderName}/requirement.json`;
  console.log(folderPath)

  // 检查文件是否存在
  fs.access(folderPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File does not exist:', err);
      return res.status(404).json({ error: 'File not found' });
    }

    // 读取文件内容并发送给客户端
    fs.readFile(folderPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return res.status(500).json({ error: 'Error reading file' });
      }
      try {
        const jsonData = JSON.parse(data);
        console.log(jsonData);
        res.json(jsonData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).json({ error: 'Error parsing JSON' });
      }
    });
  });

});

//以下是line的部分


const clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);
  console.log('Client connected');

  // 當客戶端斷開連接時，從數組中移除該實例
  ws.on('close', () => {
    console.log('Client closed')
    const index = clients.indexOf(ws);
    if (index > -1) {
      clients.splice(index, 1);
    }
  });
});

function sendNotificationToAllClients(message, data) {
  setTimeout(() => {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        // 將 message 和 data 包裝成一個對象發送
        client.send(JSON.stringify({ message, data }));
      }
    });
  }, 5000);
}

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'MySQL',
  database: 'test',
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

// console.log("Channel Access Token:", process.env.CHANNEL_ACCESS_TOKEN);
// console.log("Channel Secret:", process.env.CHANNEL_SECRET);



const lineClient = new line.Client(lineConfig);


const imageMessage = {
  type: 'image',
  originalContentUrl: `https://i.pinimg.com/564x/04/3a/19/043a198abfc4e47ca2859038bcfac77d.jpg`,
  previewImageUrl: `https://i.pinimg.com/564x/04/3a/19/043a198abfc4e47ca2859038bcfac77d.jpg`
};

function ErrMes(Status="Error", Message=null, Else=null){
  let structure = {
      "Status" : Status,
      "Message" : Message,
      "Error" : Else
  }
  return structure
}



// lineClient.pushMessage("Ued478d9a14b1d998ed0c3aaf425a739c" ,imageMessage)

// lineClient.pushMessage("Ued478d9a14b1d998ed0c3aaf425a739c",[
//     {
//         "type": "text",
//         "text": "測試發送文字"
//     }
// ])


server.post('/webhook', lineMiddleware(lineConfig), (req, res) => {
  // console.log("Received Webhook:", req.body); 

  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((error) => {
        console.error("Error handling events:", error);
        res.status(500).end();
    });
});

function handleEvent(event) {
  // console.log(event);
  // console.log(event.source.userId)
  if (event.type === 'follow') {
    const LineId = event.source.userId;
  
    axios.get(`https://api.line.me/v2/bot/profile/${LineId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
      }
    })
    .then(response => {
      const userProfile = response.data;
      const userName = userProfile.displayName; // 獲取用戶的名字
    
      console.log(`User ${userName} has followed!`);
  
      // 数据库更新逻辑，放在 axios 请求之后，确保获取到 userName
      const Updatesql = "UPDATE users SET added = 1 WHERE line_id = (?)";
      db.query(Updatesql, [LineId], (err, data) => {
        if (err) throw err;
  
        console.log(data.info);
        if (data.changedRows > 0) {
          const SelectSql = "SELECT * FROM users WHERE line_id = ?";
          db.query(SelectSql, [LineId], (err, updatedData) => {
            if (err) throw err;
  
            // 显示更新后的行数据
            const userId = updatedData[0].id;
            sendNotificationToAllClients(`User ${userId} has added friend`, userId);
          });
        } else {
          // 没有行被更新，可能条件不符合
          console.log("No rows were updated.");
        }
      });
  
      // 发送感谢消息，获取到 userName 后
      const messages = {
        type: 'text',
        text: `感謝${userName}成為我的好友！如果有任何問題，隨時告訴我哦！😊`
      };
  
      // 回复消息给 LINE 用户
      return lineClient.replyMessage(event.replyToken, messages);
    })
    .catch(error => {
      console.error('Error getting profile or sending message:', error.response ? error.response.data : error.message);
    });
  }
  
  if (event.type === 'message' && event.message.type === 'text'){
    const echo = { type: 'text', text: event.message.text };

    return lineClient.replyMessage(event.replyToken, echo);
  }
  
}

// function handleFollow(event) {
//   const userId = event.source.userId;
//   console.log('User ID from Event:', userId); // 添加調試輸出

//   const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.LINE_LOGIN_ID}&redirect_uri=${process.env.LINE_REDIRECT_URI}&scope=openid%20profile&state=${userId}&nonce=abcdefg&bot_prompt=aggressive`;

//   const message = {
//     type: 'template',
//     altText: '歡迎！請點擊以下按鈕登入',
//     template: {
//       type: 'buttons',
//       text: '歡迎加好友！點擊下方按鈕登入。',
//       actions: [
//         {
//           type: 'uri',
//           label: '登入',
//           uri: loginUrl
//         }
//       ]
//     }
//   };

//   return lineClient.replyMessage(event.replyToken, message);
// }

router.get('/callback', async (req, res) => {
  // 從請求的 URL 查詢參數中獲取授權碼
  const authorizationCode = req.query.code;
  const userId = req.query.state;

  if (authorizationCode) {
    try {
      // 使用授權碼交換 access token

      const options = querystring.stringify({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: process.env.LINE_REDIRECT_URI,
        client_id: process.env.LINE_LOGIN_ID,
        client_secret: process.env.LINE_CLIENT_SECRET,
      });

      const response = await axios.post('https://api.line.me/oauth2/v2.1/token', options, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const accessToken = response.data.access_token;
      const idToken = response.data.id_token; // 如果需要
      const decodedToken = jwt.decode(idToken);
      const userIdFromToken = decodedToken.sub;

      const Profile = await getLineProfile(accessToken)
      const LineId = Profile.userId

      const Secletsql = "SELECT * FROM users WHERE id = (?)"
      const Updatesql1 = "UPDATE users SET line_id = (?) WHERE id = (?)"
      const Updatesq2 = "UPDATE users SET added = 1 WHERE  id = (?) AND line_id = (?)"
      const Confirmsql = "SELECT * FROM users WHERE line_id = (?) AND added = 1"
    
      db.query( Secletsql, [userId], ( err, data ) => {
        if (err) throw(err)
          // return res.status(500).json({ status: "Error", message: "System error" });

        if (data.length > 0) {
          db.query( Updatesql1, [ LineId, userId ], ( err, data ) => {
            if (err) throw(err)
              // return res.status(500).json({ status: "Error", message: "System error" });
    
            db.query( Confirmsql, [ LineId ], ( err, data ) => {
              if (err)throw(err)
                // return res.status(500).json({ status: "Error", message: "System error" });
    
              if( data.length > 0){
                db.query( Updatesq2, [ userId, LineId ], ( err, data ) => {
                  if (err) throw(err)
                    // return res.status(500).json({ status: "Error", message: "System error" });
                  // return res.status(201).json({ status: "Success", message: "Line_id Update successfully and has friend already"})
                  console.log("Line_id Update successfully and has friend already")
                  sendNotificationToAllClients("Line_id Update successfully and has friend already",userId)
                })
              }
              else console.log("Line_id Update successfully but has no friend yet")
              //sendNotificationToAllClients("Line_id Update successfully but has no friend yet",userId)
              
              //return res.status(200).json({ status: "Success", message: "Line_id Update successfully but has no friend yet"})
              
            })
    
    
          })
        } else {
          console.log("User not exist")
          // return res.status(400).json({
          //   status: "Failed",
          //   message: "User not exist"
          // });
        }
      })
      // console.log(`getLine Profile ${Profile}`)
      // console.log('Line Profile:', Profile); // 打印整个对象
      // console.log('Formatted Line Profile:', JSON.stringify(Profile, null, 2)); // 格式化后的对象
      // console.log('User ID:', Profile.userId); // 访问具体属性
      // console.log('Display Name:', Profile.displayName); // 访问具体属性
      
      // 回應給用戶
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Success</title>
            <link rel="stylesheet" href="/styles/styles.css">
          </head>
          <body>
            <div class="container">
              <div class="profile-picture-container">
                <img class="profile-picture" src="${Profile.pictureUrl}" alt="Profile Picture">
              </div>
              <h1>Login Successful!</h1>
              <p>Thanks ${Profile.displayName} for using our service!</p>
              <p>It will turn to the main page in three seconds</p>
            </div>
            <script>
              window.setTimeout(() => {
                window.location.href = 'http://localhost:8080/recieve';
              }, 3000); // 3秒后自动跳转
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error exchanging authorization code for access token:', error.response ? error.response.data : error.message);
      res.status(500).send('Error processing authorization code.');
    }
  } else {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login Failed</title>
      </head>
      <body>
        <h1>Login Failed</h1>
        <p>No authorization code found.</p>
        <script>
          // 自動關閉頁面
          window.setTimeout(() => {
            window.close();
          }, 3000); // 3秒後自動關閉
        </script>
      </body>
      </html>
    `);
  }
});


app.post('/signup', (req, res) => {
  
});


app.post('/signin', (req, res) => {

  
})

app.post('/recieve', (req, res) => {
   
})


async function getLineProfile(accessToken) {
  try {
      const response = await axios.get('https://api.line.me/v2/profile', {
          headers: {
              Authorization: `Bearer ${accessToken}`
          }
      });

      // 返回用户的 Line Profile
      //console.log(response.data)
      return response.data;
  } catch (error) {
      console.error('Error fetching Line profile:', error.response ? error.response.data : error.message);
      throw error;
  }
}

// listen on port
// const port1 = process.env.PORT || 8080;

// app.listen(port1, () => {
//   console.log(`Node listening on ${port1}`);
// });

const port2 = process.env.PORT || 8081;

server.listen(port2, () => {
  console.log(`Line listening on ${port2}`)
});


module.exports = router;
