const { text } = require("express");
const mysql = require("mysql2");

const pool = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "MySQL",
    database: "test",
    port:"3306"
  });
  pool.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL database!");
  });
 

  module.exports =  pool ;