#!/usr/bin/env node
'use strict';

require('dotenv').config()

const https = require('http');
const { ArgumentParser } = require('argparse');
const { version } = require('../../package.json');
 
const parser = new ArgumentParser({
  description: 'Argparse example'
});
 
parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-l', '--login', {help: 'login to use'})
parser.add_argument('-p', '--password', {help: 'password to use'})
parser.add_argument('-t', '--to', {help: 'destination : 0, 1 or 2'})
parser.add_argument('-m', '--message', {help: 'message to send'})

/**
   Function POST: post the data "jdata" to the url "url".
   "f" is the callback when it's finished
*/
function POST(jdata,url,f) {

    const data = JSON.stringify(jdata);

    const options = {
        hostname: process.env.BACKEND_HOST,
        port: process.env.BACKEND_PORT,
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

function run(login, password, destincation_code, message)
{
    /* Doing POST ... Imbricate them*/
    POST({username: login, password: password},"/login",d => {
        console.dir(d);
        POST({jwt:d.message, data:message, dest: destincation_code},"/pushdata",d => {
            console.dir(d);
        });
    });
}

exports.run = run;
