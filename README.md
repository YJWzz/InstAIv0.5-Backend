# InstAI-prac


CREATE DATABASE `test`;
DROP DATABASE `test`; -- 刪除此資料庫
USE `test`; -- 執行此資料庫
DROP DATABASE `sql_data`;
  --  CREATE TABLE `login`(
--        `id` INT AUTO_INCREMENT PRIMARY KEY,
--        `fname` VARCHAR(255),
--        `lname` VARCHAR(255),
--        `email` VARCHAR(255),
--        `password` VARCHAR(255)
--    );
--    CREATE TABLE test.photo(
--        id INT AUTO_INCREMENT PRIMARY KEY,
--        file_name VARCHAR(255) NOT NULL,
--        image_data LONGBLOB NOT NULL
--    );
   CREATE TABLE `CreateFolder`(
       `id` INT AUTO_INCREMENT PRIMARY KEY,
       `user` VARCHAR(255) NOT NULL,
       `folder_name` VARCHAR(255) NOT NULL,
       `uploadtime` VARCHAR(255) NOT NULL
   );
   CREATE TABLE `Project`(
       `id` INT AUTO_INCREMENT PRIMARY KEY,
       `user` VARCHAR(255) NOT NULL,
       `folder` VARCHAR(255) NOT NULL,
       `project_name` VARCHAR(255) NOT NULL,
       `project_path` LONGBLOB NOT NULL,
       `upload_time` VARCHAR(255) NOT NULL
   );
   CREATE TABLE `Requirement`(
    id INT AUTO_INCREMENT PRIMARY KEY,
    requirement_path VARCHAR(255) NOT NULL,
    author VARCHAR(255)	 NOT NULL,
    uploadtime VARCHAR(255) NOT NULL
);

	CREATE TABLE `users`(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    line_id VARCHAR(255)
);
ALTER TABLE users
ADD COLUMN added BOOLEAN DEFAULT FALSE;

DROP TABLE `login`;
DROP TABLE `CreateFolder`;
DROP TABLE `Project`;
DROP TABLE `Requirement`;
DROP TABLE `users`;

//MySQL改用這個

