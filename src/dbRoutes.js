const express = require('express');
const uniqueID=require('./uniqueID');

const authLogs=require('./authLogs')
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")

const saltRounds = 10
require('dotenv').config();

function createRouter(db) {

    const router = express.Router();

  //-------------Register user------------------------------------

    router.post('/api/user/register', async(req, res, next) => {
     
      if(req.body===null || req.body==={})
        res.status(500).json({status: 'error: data null'});
  
      var uid=uniqueID()
      var new_uid=uid.slice(14)+"-"+Date.now().toString(36);      
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      console.log(hashedPassword)      

     db.query(
        'INSERT INTO users (id,name, email, mobile, password,last_modified, isactive,islocked) VALUES(?,?,?,?,?,?,?,?)',
        [new_uid,req.body.name, req.body.email, req.body.mobile, hashedPassword, new Date(), true,false],        
        (error) => {
          if (error) {            
            if(error.code === 'ER_DUP_ENTRY')
              return res.status(500).json({status:'error',message:'email or mobile number already exists'})
            else  
            return res.status(500).json({status: 'error', message:''});
          } 
          else {
            return res.status(200).json({status: 'ok', message:''});
          }
        }
      );        

    });

//-------------Login user--------------------------------------

    router.post('/api/user/login', async (req, res, next)=> {
      
      if(req.body===null || req.body==={})
      res.status(500).json();

      if(!req.body.mobile || !req.body.password) 
      res.status(500).json();

      let queryString='SELECT id,mobile,password FROM users where mobile=' + req.body.mobile;

      db.query(queryString, async(error, results) => {
          if (error) return res.status(500).json();
                    
          if(results.length<=0) return res.status(200).json({});
           
          const isCorrectPass=await bcrypt.compare(req.body.password,results[0].password)
          
            if(isCorrectPass)
            {
                authLogs(db,{id:results[0].id,action:'login',action_status:1});
                const jwt_secret = process.env.JWT_SECRET;               
                const user_token= jwt.sign({ user: results[0].mobile}, jwt_secret,{ expiresIn: '5m' });
                return res.status(200).json({token: user_token}); 
            }
            else
            {   
              authLogs(db,{id:results[0].id,action:'login',action_status:0})      
              return res.status(200).json();
            }
          
        }
      );

    });

//------------------- Verify token -------------------------------------
    
    router.post('/api/verify', async (req, res, next)=> {

      var token = req.headers['authorization']
      if(!token) res.status(200).json(false);
     
      const jwt_secret = process.env.JWT_SECRET; 
      
      try {         
          var decoded = jwt.verify(token, jwt_secret);
          res.status(200).json(true);
      } 
      catch(err) {         
          res.status(200).json(false);
      }
    })


//------------------------------------------------------------------------

    router.get('/users/get', function (req, res, next) {
      db.query(
        'SELECT id, username,type, password, last_modified FROM users',      
        (error, results) => {
          if (error) {
            console.log(error);
            res.status(500).json({status: 'error'});
          } else {
            res.status(200).json(results);
          }
        }
      );
    });

    router.get('/users/get/:id', function (req, res, next) {
      db.query(
        'SELECT id, username,type, password, last_modified FROM users where id='+ req.params.id,      
        (error, results) => {
          if (error) {
            console.log(error);
            res.status(500).json({status: 'error'});
          } else {
            res.status(200).json(results);
          }
        }
      );
    });

    router.put('/users/update/:id', function (req, res, next) {

      var pid=req.params.id  
      console.log(pid)

      db.query(
        'UPDATE users SET username=?, type=?, password=?,last_modified=? where id=?',
        [req.body.username,req.body.type, req.body.password,new Date(), pid],
        (error)=>
        {
          if (error) {
            res.status(500).json({status: 'error'});
          } else {
            console.log(error)
            res.status(200).json({status: 'ok'});
          }
        }       
      );
    });

    router.delete('/users/delete/:id', function (req, res, next) {
    
      var pid=req.params.id 
      var qry='DELETE FROM users WHERE id=' + [pid]; 
  
      db.query(qry,      
        (error,result) => {
          if (error) {           
            res.status(500).json({status: 'error'});
          } else {           
            res.status(200).json({status: 'ok'});
          }
        }
      );
    });

    return router;
}
module.exports = createRouter;