const express = require('express');
const amqp = require('amqplib/callback_api');
require('dotenv').config()

const opt = { credentials: require('amqplib').credentials.plain(process.env.AMQP_USER, process.env.AMQP_PASS) };

// import schemas from './schemas.js'
const schemas = require('../schemas')
const validate = require('jsonschema').validate

const app = express();
app.use (express.json());

const queues = require("../db/routingdb").queues

const auth_table = require("../db/authdb").auth

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
    
            channel.assertQueue(queue, {
                durable: true
            });
    
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    
            channel.consume(queue, function(msg) {
                console.log(" [x] Received %s", msg.content.toString());
                //verify data
                data = JSON.parse(msg.content.toString());
                console.log("parse ok");
                if (validate(data, schemas.schemaFromBackend).valid){
                    //valid data
                    //check if trafic is legal
                    client = auth_table.find(element => element.id == data.from);
                    if (client == undefined) {
                        console.log("Error : client %s is not in database", data.from);
                    } else {
                        //client found
                        //check authorization
                        if (client.authorized_dest.includes(data.dest)) {
                            //authorized
                            //send msg to destination queue
                            const queue = queues[data.dest - 1];
                            channel.assertQueue(queue);
                            channel.sendToQueue(queue, Buffer.from(data.msg));
                            console.log("message '%s' sent to queue '%s'", data.msg, queue);
                        } else {
                            console.log("illegal action");
                        }
    
                    }
                } else {
                    console.log("indalid data");
                }
            }, {
                noAck: true
            });
        });
    });
}

exports.run = run;
