const express = require('express');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib/callback_api');

require('dotenv').config()

// import schemas from './schemas.js'
const schemas = require('../schemas')
const validate = require('jsonschema').validate

//authenticationb table that contains for each client its id, password and token
auth_table = require("../db/authdb").auth

const app = express();
app.use(express.json());
const host = process.env.BACKEND_HOST; // Utiliser 0.0.0.0 pour être visible depuis l'exterieur de la machine
const port = process.env.BACKEND_PORT;

const ACCESS_TOKEN_SECRET = "123456789";
const ACCESS_TOKEN_LIFE = 120;

//connection arguments for amqp.connect function
const amqp_connect_opt = {hostname:process.env.AMQP_HOST, username:process.env.AMQP_USER, password:process.env.AMQP_PASS}


function isDataValid(data, schema) {
    return validate(data, schema).valid
}

function login(data,res) {
    console.log("login");

    if (isDataValid(data, schemas.schemaLogin)) {
        //find client in auth table
        client = auth_table.find(element => element.id == data.username && element.pass == data.password);
        if (client == undefined) {
            //client is not in database
            // Reply to client as error code 401 (no error in HTTP); Reply data format is json
            res.writeHead(401, {'Content-Type': 'application/json'});
            // Send back reply content
            res.end(JSON.stringify({"error":-1,"message":"login error"}));
        } else {
            // client found in table
            console.log(data);
            console.log('Username:',data.username,'Passwd:',data.password);
            client.jwt = jwt.sign({"username":data.username}, ACCESS_TOKEN_SECRET, {
                algorithm: "HS512",
                expiresIn: ACCESS_TOKEN_LIFE
            });
            // Reply to client as error code 200 (no error in HTTP); Reply data format is json
            res.writeHead(200, {'Content-Type': 'application/json'});
            // Send back reply content
            res.end(JSON.stringify({"error":0,"message":client.jwt}));
        }
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
                channel.sendToQueue(queue, Buffer.from(JSON.stringify({dest:data.dest, data:data.data, from:decoded.username})));
                //reply OK
                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({"error":0,"message":"data added"}));
            }
        });
    } else {
        //json schema invalid
        res.writeHead(402, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({"error":-1,"message":"content error"}))
    }
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
    amqp.connect(amqp_connect_opt, function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
        
            var queue = 'from_backend';
        
            channel.assertQueue(queue, {
                durable: true
            });
            
            set_routes(channel, queue)
        });
    });
}


exports.run = run;
