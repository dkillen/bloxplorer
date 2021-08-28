const Web3 = require('web3');
const Web3Error = require('./errors');

class BlockDataService {
  constructor(_web3Provider, _dataStore) {
    this.web3 = new Web3(_web3Provider);
    this.dataStore = _dataStore;
  }

  /**
   * Sets the data store to use for retrieving data persisted in a database.
   * @param {DataStore} _dataStore - the data store to be used for this instance.
   */
  setDataStore = (_dataStore) => {
    this.dataStore = _dataStore;
  };

  /**
   * Given a valid block number returns the data for that block
   * @param {number} _blockNumber - The number of the block to retrieve data for.
   * @returns {Object} - The block data or null if no data retrieved.
   */
  getBlockData = async (_blockNumber) => {
    let block = null;

    // block = this.dataStore.retrieveBlockData(_blockNumber);

    if (block === null) {
      try {
        block = await this.web3.eth.getBlock(_blockNumber, true);
      } catch (error) {
        throw new Web3Error(error.message, 'eth.getBlock');
      }
    }

    // this.dataStore.storeBlockData(block);

    return block;
  };
}

module.exports = BlockDataService;
