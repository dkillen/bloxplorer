#!/usr/bin/env node
require('dotenv').config();
const yargs = require('yargs/yargs');
const Bloxplore = require('./src/bloxplore');

const bloxplorer = new Bloxplore(process.env.INFURA_ENDPOINT);
