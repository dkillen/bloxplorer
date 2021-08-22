const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'Test.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Configure solidity compiler input
const input = {
  language: 'Solidity',
  sources: {
    'Test.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

// Compile solidity contract and export the contract interface and bytecode
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const interface = output.contracts['Test.sol']['Test'].abi;
const bytecode = output.contracts['Test.sol']['Test'].evm.bytecode.object;
module.exports = { interface, bytecode };
