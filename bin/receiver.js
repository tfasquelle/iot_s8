#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
require('dotenv').config()

const { ArgumentParser } = require('argparse');
const { version } = require('../package.json');

//parse arguments
const parser = new ArgumentParser({
  description: 'Argparse example'
});
parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-t', '--to', {help: 'destination : 0, 1 or 2'})
var args = parser.parse_args()

if (args.to == undefined || args.to == 0) {
    console.log("destination error");
    process.exit();
}

//get queue name from routing table
const queue = require("../src/routingdb").queues[parseInt(args.to) - 1];

const opt = { credentials: require('amqplib').credentials.plain(process.env.AMQP_USER, process.env.AMQP_PASS) };

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