
const express = require('express');
const amqp = require('amqplib/callback_api');
require('dotenv').config()

const opt = { credentials: require('amqplib').credentials.plain(process.env.AMQP_USER, process.env.AMQP_PASS) };

// import schemas from './schemas.js'
const schemas = require('../src/schemas')
const validate = require('jsonschema').validate

const app = express();
app.use (express.json());

queues = require("../src/routingdb").queues

auth_table = require("../src/authdb").auth

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
                // authorized = false
                client = auth_table.find(element => element.id == data.from);
                if (client == undefined) {
                    console.log("Error : client %s is not in database", data.from);
                } else {
                    //client found
                    //check authorization
                    if (client.authorized_dest.includes(data.dest)) {
                        //authorized
                        //send msg to destination queue
                        channel.assertQueue(queues[data.dest - 1]);
                        channel.sendToQueue(queues[data.dest - 1], Buffer.from(data.msg));
                        console.log("message sent to queue");
                    } else {
                        console.log("illegal action");
                    }

                }
                // auth_table.every(element => {
                //     if (element.id == data.from){
                //         //client found
                //         if (element.authorized_dest.includes(data.dest)){
                //             authorized = true
                //         }
                //         return false;
                //     }
                // });
                // if (authorized){
                //     //send msg to destination queue
                //     channel.assertQueue(queues[data.dest - 1]);
                //     channel.sendToQueue(queues[data.dest - 1], Buffer.from(data.msg));
                //     console.log("message sent to queue");
                // } else {
                //     console.log("illegal action");
                // }
                
            } else {
                console.log("indalid data");
            }
        }, {
            noAck: true
        });
    });
});