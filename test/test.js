const assert = require('chai').assert;
const expect = require('chai').expect;
const should = require('chai').should();

const Bloxplore = require('../src/bloxplore');

describe('Block Explorer', () => {
  beforeEach(() => {
    // Need to create a contract on the test network to test against.
    // Need to set up some transactions on the test network to test against.
    this.bloxplorer = new Bloxplore('http://localhost:8545');
  });

  it('should get a block', async () => {
    const result = await this.bloxplorer.getBlockData(1);
    expect(result).to.be.true;
  });
});
