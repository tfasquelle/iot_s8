const express = require('express');
const amqp = require('amqplib/callback_api');
require('dotenv').config()

//connection arguments for amqp.connect function
const amqp_connect_opt = {hostname:process.env.AMQP_HOST, username:process.env.AMQP_USER, password:process.env.AMQP_PASS}

// import schemas from './schemas.js'
const schemas = require('../schemas')
const validate = require('jsonschema').validate

const app = express();
app.use (express.json());

//get database info : authorisations and queues names
const queues = require("../db/routingdb").queues

const auth_table = require("../db/authdb").auth

function run()
{
    //connect to server
    amqp.connect(amqp_connect_opt, function(error0, connection) {
        if (error0) {
            throw error0;
        }
        //create channel
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
    
            var queue = 'from_backend';
            
            //create queue if it doesn't exists
            channel.assertQueue(queue, {
                durable: true
            });
            // Create all output queues
            queues.forEach(element => {
                channel.assertQueue(element, {durable: true});
            });
            
    
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    
            channel.consume(queue, function(d) {
                console.log(" [x] Received %s", d.content.toString());
                //verify data
                data = JSON.parse(d.content.toString());
                if (validate(data, schemas.schemaFromBackend).valid){
                    client = auth_table.find(element => element.id == data.from);
                    if (client == undefined) {
                        console.log("Error : client %s is not in database", data.from);
                    } else {
                        //client found
                        //check authorization
                        if (client.authorized_dest.includes(data.dest) && data.dest <= queues.length) {
                            //authorized
                            //send data to destination queue
                            const queue = queues[data.dest];
                            channel.sendToQueue(queue, Buffer.from(JSON.stringify(data.data)));
                            console.log("message '%s' sent to queue '%s'", JSON.stringify(data.data), queue);
                        } else {
                            console.log("illegal action");
                        }
                    }
                } else {
                    console.log("invalid schema");
                }

            }, {
                noAck: true
            });
        });
    });
}

exports.run = run;
