const express = require('express');
const redis = require("redis");
require('dotenv').config()

const app = express();
app.use(express.json());

const host = process.env.REST_HOST; // Utiliser 0.0.0.0 pour être visible depuis l'exterieur de la machine
const port = process.env.REST_PORT;

const redis_connect_opt = {host:process.env.REDIS_HOST, password:process.env.REDIS_PASS};


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

function get_temperature(client_redis, location, res)
{
    client_redis.get(location, (err, value) => {
        if (err){
            throw err;
        }
        if (value != null) {
            console.log("%s : %s", location, value);
            // Reply to client as error code 200 (no error in HTTP); Reply data format is json
            res.writeHead(200, {'Content-Type': 'application/json'});
            // Send back reply content
            res.end(JSON.stringify({temperature:value}));
        } else {
            console.log("no value for %s", location);
            res.setHeader('Content-Type', 'application/json');
            res.status(404);
            res.end(JSON.stringify({"error":-1,"message":"404"}));
        }

    });
}

function set_routes(client_redis)
{
    app.get('/temp/*', (req, res) => {
        console.log("GET 404", req.originalUrl);
        get_temperature(client_redis, req.url.split('/').pop(),res);
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
    const client_redis = redis.createClient(redis_connect_opt);

    client_redis.on("error", function(error) {
        console.error(error);
    });

    set_routes(client_redis)
}


exports.run = run;
