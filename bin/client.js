#!/usr/bin/env node
'use strict';

const https = require('http');
const { ArgumentParser } = require('argparse');
const { version } = require('../package.json');
 
const parser = new ArgumentParser({
  description: 'Argparse example'
});
 
parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-l', '--login', {help: 'login to use'})
parser.add_argument('-p', '--password', {help: 'password to use'})
parser.add_argument('-t', '--to', {help: 'destination : 0, 1 or 2'})
parser.add_argument('-m', '--message', {help: 'message to send'})

var args = parser.parse_args()

/**
   Function POST: post the data "jdata" to the url "url".
   "f" is the callback when it's finished
*/
function POST(jdata,url,f) {

    const data = JSON.stringify(jdata);

    const options = {
        hostname: 'localhost',
        port: 8000,
        path: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', (d) => {
            let jd = JSON.parse(d.toString('utf-8'));
            f(jd);
        });
    });

    req.on('error', error => {
        console.error(error);
    });

    req.write(data);
    req.end();
}


async function pulling(res){
    if (res.order!='end'){
        setTimeout(() => {
            POST({pulldata:'pull'},"/orders",d => {
            console.log(d);
            pulling(d);
        });;}
        , wait);
    }
}

// Setting default value
let login = args.login || "test";
let password = args.password || "pass";
let destCode = parseInt(args.to) || 0;
let msg = args.message || "ok";


/* Doing POST ... Imbricate them*/
POST({username: login, password: password},"/login",d => {
    console.dir(d);
    POST({jwt:d.message, data:msg, dest: destCode},"/pushdata",d => {
        console.dir(d);
    });
});


// // pulling
// console.log("now requesting orders from server\n");
// var wait = 3000
// // pulling('start')

