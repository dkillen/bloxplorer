#!/usr/bin/env node
require('dotenv').config();
// const yargs = require('yargs/yargs');
const Bloxplore = require('./src/bloxplore');

const argv = require('yargs/yargs')(process.argv.slice(2))
  .usage('Usage: $0 number [number] [options]')
  .example('$0 0', 'Display a transfer report for the current block.')
  .example('$0 5', 'Display a transfer report for the last 5 blocks.')
  .example('$0 1000 1100', 'Display a transfer report for blocks 1000 - 1100.')
  .options({
    s: {
      alias: 'senders',
      describe: 'Get a sending addresses report',
      boolean: true,
      default: false,
    },
    r: {
      alias: 'receivers',
      describe: 'Get a receiving addresses report',
      boolean: true,
      default: false,
    },
    f: {
      alias: 'full',
      describe: 'Get a full report',
      boolean: true,
      default: false,
    },
  })
  .help('h')
  .alias('h', 'help').argv;

const bloxplorer = new Bloxplore(process.env.INFURA_ENDPOINT);

const args = argv._;
const getSenderReport = argv.s;
const getReceiversReport = argv.r;
const getFullReport = argv.f;

console.log(
  '\nGetting your reports. Please be patient, this could take a while.\n'
);
if (args.length === 1) {
  bloxplorer
    .getBlockData(args[0])
    .then((result) => {
      if (result) {
        console.clear();

        const statistics = generateStats();

        console.log('\n--== Block Statistics ==--\n');
        console.table(statistics);
        console.log();

        if (getSenderReport || getFullReport) {
          displaySendersReport();
        }

        if (getReceiversReport || getFullReport) {
          displayReceiversReport();
        }
      }
    })
    .catch((err) => {
      console.log(
        `\n*** An error occured while processing your request. Error message: ${err.message}\n`
      );
    });
} else {
  bloxplorer
    .getBlockData(args[0], args[1])
    .then((result) => {
      if (result) {
        console.clear();

        const statistics = generateStats();

        console.log('\n--== Block Statistics ==--\n');
        console.table(statistics);
        console.log();

        if (getSenderReport || getFullReport) {
          displaySendersReport();
        }

        if (getReceiversReport || getFullReport) {
          displayReceiversReport();
        }
      }
    })
    .catch((err) => {
      console.log(
        `\n*** An error occured while processing your request. Error message: ${err.message}\n`
      );
    });
}

const generateStats = () => {
  const statistics = [
    {
      description: 'Total value of ether transferred',
      value: bloxplorer.totalEtherTransferred,
    },
    {
      description: 'Number of unique addresses sent a transaction',
      value: bloxplorer.sendingAddresses.size,
    },
    {
      description: 'Number of unique addresses received a transaction',
      value: bloxplorer.receivingAddresses.size,
    },
    {
      description: 'Number of contracts created',
      value: bloxplorer.contractsCreated,
    },
    {
      description: 'Number of uncles created',
      value: bloxplorer.unclesCount,
    },
  ];
  return statistics;
};

const displaySendersReport = () => {
  bloxplorer
    .getSendersReport()
    .then((report) => {
      console.log('--== Ether Senders Report ==--\n');
      console.table(report);
      console.log();
    })
    .catch((err) => {
      console.log(
        `\n*** An error occured while processing your request. Error message: ${err.message}\n`
      );
    });
};

const displayReceiversReport = () => {
  bloxplorer
    .getReceiversReport()
    .then((report) => {
      console.log('--== Ether Receivers Report ==--\n');
      console.table(report);
      console.log();
    })
    .catch((err) => {
      console.log(
        `\n*** An error occured while processing your request. Error message: ${err.message}\n`
      );
    });
};
