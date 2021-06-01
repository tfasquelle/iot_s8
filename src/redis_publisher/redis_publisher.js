#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const redis = require("redis");
require('dotenv').config();

//connection arguments for amqp.connect function
const amqp_connect_opt = {hostname:process.env.AMQP_HOST, username:process.env.AMQP_USER, password:process.env.AMQP_PASS};

const redis_connect_opt = {host:process.env.REDIS_HOST, password:process.env.REDIS_PASS};

function run()
{
    //get queue name from routing table
    const queue = require("../db/routingdb").queues[0];

    amqp.connect(amqp_connect_opt, function(error0, connection) {
            if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            channel.assertQueue(queue, {durable: true});

            const client_redis = redis.createClient(redis_connect_opt);

            client_redis.on("error", function(error) {
                console.error(error);
            });

            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

            channel.consume(queue, function(msg) {
                console.log(" [x] Received %s", msg.content.toString());
                data = JSON.parse(msg.content);
                client_redis.set(data.location, data.temperature, redis.print);
            }, {
                noAck: true
            });
        });
    });
}

exports.run = run;
