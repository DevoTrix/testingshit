const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  req.session.logged_in = false;
  // const cookieHeader = req.headers.cookie;
  //   if(!cookieHeader){
  //     res.redirect('/home');
  //     return;
  //   }
  //   const cookies = cookieHeader.split(';');
  //   const token = cookies.find(cookie => cookie.trim().startsWith('token=')).split('=')[1];
  res,clearCookie('token').send('Cookie Cleared');
  res.redirect("/home");
});
module.exports = router;
