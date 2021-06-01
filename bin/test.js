require('dotenv').config();
const redis = require("redis");

const IP = process.env.REDIS_HOST || "127.0.0.1";
const password = process.env.REDIS_PASS || 'guest';

const opt = {host:IP, password:password}

// const client = redis.createClient({host:IP, user:username, password:password});
const client = redis.createClient(opt);


client.on("error", function(error) {
    console.error(error);
});

// client.get("angers", redis.print);

client.get("lhbj", (err, value) => {
    if (err){
        throw err;
    }
    console.log(value);
});




client.quit();
