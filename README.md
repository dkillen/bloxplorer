# Bloxplorer

Bloxplorer is a limited Ethereum block explorer run from the command-line. Bloxplorer will generate and output reports on a block or a range of blocks. The heart of Bloxplorer is the Bloxplore class which encapsulates the block data and operations on that data to generate ether transfer reports.

To build and run Bloxplorer you will need to have NodeJS installed. Bloxplore has been built and tested with NodeJS version 16.4.0 and 16.7.0.

## Building Bloxplorer

To run Bloxplorer you will need to clone this repository and install the dependencies.

### Clone the repository

```
$ git clone https://github.com/dkillen/bloxplorer.git
```

### Install dependencies

```
$ npm install
```

## Running tests

The test directory provides a suite of unit tests (including a simple solidity smart contract). The unit tests are run against instances of the Bloxplore class. The unit tests will run a local ganache-cli blockchain for testing purposes. The unit tests will also generate both text and html code coverage reports. Run the tests with:

```
$ npm test
```

## Using the Bloxplorer tool

Bloxplorer has been developed using [Infura](https://infura.io) to provide an endpoint to make RPC method calls. Before running the Bloxplorer tool you will need an Infura endpoint for either the Ethereum Mainnet or a test network. Create a file named .env in the project's root directory. The contents of the .env file must be:

```
INFURA_ENDPOINT='https://mainnet.infura.io/v3/YOUR-PROJECT-ID'
```

where YOUR-PROJECT-ID is your Infura project ID. Once you have that, you're ready to go.

## Bloxplorer CLI - Usage

Bloxplorer is capable of producing several useful reports on single blocks or a range of blocks. More details on each report are found in the Reports section below. **It should be noted that requesting data for a range of blocks can take some time to process.** It is suggested that the range of blocks is kept small. Even requests on a single block can appear time consuming if that block includes a large number of transactions.

Bloxplorer may be run from the projects root directory with the following:

```
$ node bloxplorer.js number [number] [options]
```

If you need help, Bloxplorer's parameters and options can be displayed with:

```
$ node bloxplorer.js -h
```

Where the first and only parameter supplied is 0, Bloxplorer will display the Block Statistics Report for the current block. The Block Statistics Report is always displayed.

```
$ node bloxplorer.js 0
```

Bloxplorer's command-line options allow you to also display either or both an Ether Senders Report and an Ether Receivers Report

Display the Ether Senders Report for the current block:

```
$ node bloxplorer.js 0 -s
```

Display the Ether Receivers Report for the current block:

```
$ node bloxplorer.js 0 -r
```

To get a full report (both the Senders Report and Receivers Report) for the current block:

```
$ node bloxplorer.js 0 -f
```

A report can be obtained for the last n blocks (inclusive of the current block) by supplying a positive integer as the first parameter:

```
$ node bloxplorer.js 5 -f
```

A report can be obtained for a range of specific blocks by supplying the start and end block numbers:

```
$ node bloxplorer.js 13086160 13086165 -f
```

If you wish to obtain a report for a single specific block only, use the same block number for both parameters:

```
$ node bloxplorer.js 13086160 13086160 -f
```

## Reports

### Block Statistics Report

The first report is a Block Statistics summary. This report is always displayed and summarises the following data for the blocks:

1. Total value of ether transferred.
2. The number of unique addresses that sent a transaction.
3. The number of unique addresses that received a transaction.
4. The number of contracts that were created.
5. The number of uncles created.

### Ether Senders Report

The ether senders report displays all addresses that sent a transaction, the total ether sent by that address and whether the sending address is a contract. The senders report is displayed if selected with either the -s or -f options.

### Ether Receivers Report

The ether receivers report displays all addresses that received a transaction, the total ether received by that address and whether the receiving address is a contract. The receivers report is displayed if selected with either the -r or -f options.

## License

GPL 3.0
