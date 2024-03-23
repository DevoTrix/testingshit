const express = require("express");
const app = express();

console.log("Entered ctest.js");

app.get("/",  async (req, res) => {
    console.log("Hello World - Cron here!");
    res.sendStatus(200);
  });

module.exports = app;