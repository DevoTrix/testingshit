const express = require("express");
const router = express.Router();
const { exec } = require('child_process');
const fetch = require("node-fetch");
// Getting all
router.get("/", async (req, res) => {

  const response  = await fetch('/api/genMap', {
    method:"POST",
    headers:{
      'Content-Type': 'application/json',
      'pm_type': 'pm25'
    }
  })
  const response2  = await fetch('/api/genMap', {
    method:"POST",
    headers:{
      'Content-Type': 'application/json',
      'pm_type': 'pm10'
    }
  })
  res.render("home", {
    title: "AirPolice",
  });
  res.status(200);
});

module.exports = router;
