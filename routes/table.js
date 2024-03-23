const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
// Getting all
const postgreConfig = {
  connectionString: process.env.POSTGRES_URL ,
};

router.get("/", async (req, res) => {
  try {
    // await fetchTableData()
    var pool = new Pool(postgreConfig);
    const con = await pool.connect();
    var query = "SELECT * FROM usrs WHERE username = $1";
    const cookieHeader = req.headers.cookie;
    if(!cookieHeader){
      res.redirect('/rlogin?error=ngl');
      return;
    }
    const cookies = cookieHeader.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    var token;
    if (tokenCookie) {
        token = tokenCookie.split('=')[1];
        // Token exists, continue processing
    } else {
        res.redirect('/rlogin?error=ngl');
    }
    let user;
    let isPorter = false;
    if (token) {
      jwt.verify(token, process.env.key, (error, decoded) => {
        if (error) {
          isPorter = false;
          //  add errors here redirecting
          res.redirect('/home');
        }
        user = decoded.username;
      });
    }
    if (user === process.env.porterUser) {
      isPorter = true;
    } else {
      isPorter = false;
    }

    var query = "SELECT username FROM usrs WHERE username = $1";
    let value = [user];
    var result;
    result = await con.query(query, value);
    const rows = result.rows;

    if (rows.length > 0) {
      await con.release();
      res.render("table", {
        title: "AirPolice Map",
        body: "success",
        isLoggedIn: true,
        isPorterUser: isPorter,
      });
      res.status(200);
    } else {
      await con.release();
      res.redirect("/rlogin?error=ngl");
    }
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
