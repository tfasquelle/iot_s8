const express = require('express');
const jwt = require('jsonwebtoken');

// import schemas from './schemas.js'
const schemas = require('./schemas')
const validate = require('jsonschema').validate

//authenticationb table that contains for each client its id, password and token
auth_table = require("./authdb").auth

const app = express();
const host = 'localhost'; // Utiliser 0.0.0.0 pour être visible depuis l'exterieur de la machine
const port = 8000;

const ACCESS_TOKEN_SECRET = "123456789";
const ACCESS_TOKEN_LIFE = 120;

const amqp = require('amqplib/callback_api');
require('dotenv').config()

const opt = { credentials: require('amqplib').credentials.plain(process.env.AMQP_USER, process.env.AMQP_PASS) };


const ordres = [ 
    {"order": "plouf1\n"}, 
    {"order": "plouf2\n"}, 
    {"order": "plouf3\n"}, 
    {"order": "end"}
]
var i = 0;



function isDataValid(data, schema) {
    return validate(data, schema).valid
}

function login(data,res) {
    console.log("login");

    if (isDataValid(data, schemas.schemaLogin)) {
        //find client in auth table
        auth_table.forEach(element => {
            if (data.username == element.id && data.password == element.pass) {
                // client found in table
                console.log(data);
                console.log('Username:',data.username,'Passwd:',data.password);
                element.jwt = jwt.sign({"username":data.username}, ACCESS_TOKEN_SECRET, {
                    algorithm: "HS512",
                    expiresIn: ACCESS_TOKEN_LIFE
            });
            // Reply to client as error code 200 (no error in HTTP); Reply data format is json
            res.writeHead(200, {'Content-Type': 'application/json'});
            // Send back reply content
            res.end(JSON.stringify({"error":0,"message":element.jwt}));
            }
            return;
        });
        // if the client is not in authentication table
        // Reply to client as error code 401 (no error in HTTP); Reply data format is json
        res.writeHead(401, {'Content-Type': 'application/json'});
        // Send back reply content
        res.end(JSON.stringify({"error":-1,"message":"login error"}));
    } else  {
        //if schema not valid
        res.end(JSON.stringify({"error":-1,"message":"content error"}))
    }
}

function postdata(data,res, channel, queue) {
    console.log("Post Data",data);
    if (isDataValid(data, schemas.schemaData)) {
        // Check JWT validity
        jwt.verify(data.jwt, ACCESS_TOKEN_SECRET, function(err, decoded) {
            if (err) { // There is an error: invalid jwt ...
                res.writeHead(401, {'Content-Type': 'application/json'});
                // Send back reply content
                res.end(JSON.stringify({"error":-1,"message":"JWT error"}));
            } else {
                // Ok no problem: Adding data
                if(data.dest == 0){
                    console.log("received : %s", data.data);
                } else {
                    channel.sendToQueue(queue, Buffer.from(JSON.stringify({dest:data.dest, msg:data.data})));
                }
                
                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({"error":0,"message":"data added"}));
            }
        });
    } else {
        res.writeHead(402, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({"error":-1,"message":"content error"}))
    }
}

function pulling(data, res) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    res.send(JSON.stringify(ordres[i]))

    i = ((i+1) % (ordres.length))
}


/**
 *
 * Occur when an unkown url was called
 *
 */
function f404(data,res) {
    res.setHeader('Content-Type', 'application/json');
    res.status(404);
    res.end(JSON.stringify({"error":-1,"message":"404"}));
}

function set_routes(channel, queue)
{
    app.use(express.json());

    app.post("/pushdata", (req, res) => {
        var body = req.body;
        console.log(body);
        postdata(body,res, channel, queue);
    });

    app.post("/login", (req, res) => {
        var body = req.body;
        console.log(body);
        login(body,res);
    });

    app.post("/orders", (req, res) => {
        var body = req.body;
        console.log(body);
        pulling(body,res);
    });

    app.get('/*', (req, res) => {
        console.log("GET 404", req.originalUrl);
        f404(null,res);
    });
    app.post('/*', (req, res) => {
        console.log("POST 404",req.originalUrl);
        f404(null,res);
    });

    app.listen(port, host, () => {
        console.log(`Server is running at http://${host}:${port}`);
    });
}

function run()
{
    amqp.connect(process.env.AMQP_HOST, opt, function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
        
            var queue = 'from_backend';
            var msg = 'Hello World!';
        
            channel.assertQueue(queue, {
                durable: true
            });
            
            set_routes(channel, queue)

            // channel.sendToQueue(queue, Buffer.from(msg));
        
            console.log(" [x] Sent %s", msg);
        });
    });
}


exports.run = run;
