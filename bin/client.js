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

// Setting default value
let login = args.login || "test";
let password = args.password || "pass";
let destCode = parseInt(args.to) || 0;
let msg = args.message || "ok";

console.log("starting client %s", login);
require("../src/client/client").run(login, password, destCode, msg);
