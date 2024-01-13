const express = require('express')
const router = express.Router()
const User = require('../models/user')

// Getting all
router.get('/', (req,res) => {
    res.render('home', {
        title: 'AirPolice'
        //layout: 'home'
    });
})

let {PythonShell} = require('python-shell')

let options = {
    mode: 'text',
    pythonPath: '.venv/bin/python3',
    pythonOptions: ['-u'], // get print results in real-time
  };
  
  PythonShell.run('test.py', options).then(messages=>{
    console.log('finished');
  });




module.exports = router