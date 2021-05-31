#!/usr/bin/env node

const { ArgumentParser } = require('argparse');
const { version } = require('../package.json');

//parse arguments
const parser = new ArgumentParser({
  description: 'Argparse example'
});
parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-t', '--to', {help: 'destination : 0, 1 or 2'})

const args = parser.parse_args()

//run display
console.log("Starting receiver %s", args.to);
require("../src/display/display").run(args.to)
