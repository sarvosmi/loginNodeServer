const express = require('express');  
const bodyParser = require('body-parser');  
const cors = require('cors'); 
const mysql = require('mysql');

const db=require('./src/dbRoutes')
const Port = 5000;  

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'mysql',
    database : 'testdb'
  });
connection.connect();

const app = express();  

app.use(bodyParser.json());  
app.use(cors());  
app.use(db(connection));

app.get('/', function(req, res) {  
    res.send('hello server 5000 is working ');  
})  

app.listen(Port, function() {  
    console.log('server running on localhost: ' + Port)  
});   