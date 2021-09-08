const expect = require('chai').expect;
const assert = require('chai').assert;
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const path = require('path');

const { interface, bytecode } = require('./contracts/compile');

const SQLiteDataStore = require('../src/data-service/sqlite-data-store');
const BlockDataService = require('../src/data-service/block-data-service');

describe('Block Data Service', () => {
  let sender1, receiver1, sender2, receiver2, contractCreater, contractAddress;

  beforeEach(async () => {
    // Get some test accounts from the local test network.
    [sender1, receiver1, sender2, receiver2, contractCreater] =
      await web3.eth.getAccounts();

    // Deploy a contract on the test network to test against.
    testContract = await new web3.eth.Contract(interface)
      .deploy({ data: bytecode })
      .send({ from: contractCreater, gas: '1000000' });
    contractAddress = testContract._address;

    // How much test ether to send in a transaction
    const transactionValue = '1';

    // Transactions on the test network to test against.
    await web3.eth.sendTransaction({
      from: sender1,
      to: receiver1,
      value: web3.utils.toWei(transactionValue, 'ether'),
    });
    await web3.eth.sendTransaction({
      from: sender2,
      to: receiver2,
      value: web3.utils.toWei(transactionValue, 'ether'),
    });
    await web3.eth.sendTransaction({
      from: sender1,
      to: testContract._address,
      value: web3.utils.toWei(transactionValue, 'ether'),
    });
    await web3.eth.sendTransaction({
      from: sender2,
      to: testContract._address,
      value: web3.utils.toWei(transactionValue, 'ether'),
    });

    // Create an instance of BlockDataService using the local test network
    const testDbPath = path.resolve(__dirname, 'test.db');
    const testDataStore = new SQLiteDataStore(testDbPath);
    this.blockDataService = new BlockDataService(
      web3.currentProvider,
      testDataStore
    );
  });

  describe('getBlock()', () => {
    xit('should get a block', async () => {
      const result = await this.blockDataService.getBlockData(1);
      expect(result.number).to.equal(1);
    });

    xit("should return false if block doesn't exist", async () => {
      const result = await this.blockDataService.getBlockData(100);
      expect(result).to.equal(false);
    });

    xit('should throw an error', async () => {
      let name, method, message;
      try {
        await this.blockDataService.getBlockData('qwerty');
      } catch (err) {
        name = err.name;
        method = err.method;
        message = err.message;
      }
      expect(name).to.equal('Web3Error');
      expect(method).to.equal('eth.getBlock');
      expect(message).to.equal(
        'An error occured when calling eth.getBlock. Error message: Given input "qwerty" is not a number.'
      );
    });
  });
});
