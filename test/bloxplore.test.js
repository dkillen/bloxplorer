const expect = require('chai').expect;

const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('./contracts/compile');

const Bloxplore = require('../src/bloxplore');

describe('Block Explorer', () => {
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

    // Create an instance of Bloxplore using the local test network
    this.bloxplorer = new Bloxplore(web3.currentProvider);
  });

  it('should get a block', async () => {
    const result = await this.bloxplorer.getBlockData(0);
    expect(result).to.be.true;
  });

  it('should get the current block', async () => {
    const currentBlock = await web3.eth.getBlockNumber();
    await this.bloxplorer.getBlockData(0);
    expect(this.bloxplorer.blockData.number).to.equal(currentBlock);
  });

  it('should get the number of contracts created', async () => {
    await this.bloxplorer.getBlockData(4);
    expect(this.bloxplorer.contractsCreated).to.equal(1);
  });

  it('should get the total ether transferred', async () => {
    await this.bloxplorer.getBlockData(4);
    expect(this.bloxplorer.totalEtherTransferred).to.equal(4);
  });

  it('should get the uncles count', async () => {
    await this.bloxplorer.getBlockData(4);
    expect(this.bloxplorer.unclesCount).to.equal(0);
  });

  it('should get the receiving addresses', async () => {
    await this.bloxplorer.getBlockData(4);
    expect(this.bloxplorer.receivingAddresses.has(receiver1));
    expect(this.bloxplorer.receivingAddresses.has(receiver2));
  });

  it('should get the sending addresses', async () => {
    await this.bloxplorer.getBlockData(4);
    expect(this.bloxplorer.sendingAddresses.has(sender1));
    expect(this.bloxplorer.sendingAddresses.has(sender2));
  });

  it('should get the total value of ether received by an address', async () => {
    await this.bloxplorer.getBlockData(4);
    expect(this.bloxplorer.receivingAddresses.get(receiver1)).to.equal(1);
    expect(this.bloxplorer.receivingAddresses.get(receiver2)).to.equal(1);
  });

  it('should get the total value of ether sent by an address', async () => {
    await this.bloxplorer.getBlockData(4);
    expect(this.bloxplorer.sendingAddresses.get(sender1)).to.equal(2);
    expect(this.bloxplorer.sendingAddresses.get(sender2)).to.equal(2);
  });

  it('should get the address of a contract', async () => {
    await this.bloxplorer.getBlockData(4);
    await this.bloxplorer.getReceiversReport();
    expect(this.bloxplorer.contractAddresses.has(contractAddress));
  });

  it('should get the number of unique addresses sending transactions', async () => {
    await this.bloxplorer.getBlockData(4);
    expect(this.bloxplorer.sendingAddresses.size).to.equal(2);
  });

  it('should get the number of unique addresses receiving transactions', async () => {
    await this.bloxplorer.getBlockData(4);
    expect(this.bloxplorer.receivingAddresses.size).to.equal(3);
  });
});
