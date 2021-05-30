#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
require('dotenv').config()

const opt = { credentials: require('amqplib').credentials.plain(process.env.AMQP_USER, process.env.AMQP_PASS) };

function run(destination)
{
    if (destination == undefined || destination == 0) {
        console.log("destination error");
        process.exit();
    }

    //get queue name from routing table
    const queue = require("../db/routingdb").queues[parseInt(destination) - 1];

    amqp.connect(process.env.AMQP_HOST, opt, function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            channel.assertQueue(queue);

            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

            channel.consume(queue, function(msg) {
                console.log(" [x] Received %s", msg.content.toString());
            }, {
                noAck: true
            });
        });
    });
}

exports.run = run;
