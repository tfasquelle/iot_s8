require('dotenv').config();
const redis = require("redis");

const IP = process.env.REDIS_HOST || "127.0.0.1";
const username = process.env.REDIS_USER || 'guest';
const password = process.env.REDIS_PASS || 'guest';

const opt = {host:IP, password:password}

// const client = redis.createClient({host:IP, user:username, password:password});
const client = redis.createClient(opt);


client.on("error", function(error) {
    console.error(error);
});

client.on("error", function(error) {
    console.error(error);
});


client.set("key", "567", redis.print);
client.get("key", redis.print);




client.quit();
