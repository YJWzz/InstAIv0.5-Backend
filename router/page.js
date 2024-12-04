var express = require('express');
var page = express.Router();
const pool = require("../src/sql.js");
const path = require("path");



page.get('/Login', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

page.get('/Recieve', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

page.get('/Confirm', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

page.get('/Confirm2', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

page.get('/LineLogin', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

page.get('/Project', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

page.get('/CreateProject', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

page.get('/Download2', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

page.get('/steppage', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

page.get('/Requirement', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

page.get('/CheckData', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

page.get('/CheckRequirement', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

page.get('/Training', (req, res) => {

    const response = 200;

    res.sendFile(path.join(__dirname, "../build/index.html"));


});

module.exports = page;