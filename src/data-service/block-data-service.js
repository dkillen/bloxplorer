const Web3 = require('web3');
const Web3Error = require('../errors');

/**
 * Class implementing a data service to provide block data from the Ethereum network.
 * The service will request block data from its data store first and then if not available will
 * retrieve block data from the network.
 */
class BlockDataService {
  /**
   * BlockDataService constructor
   * @param {string} _web3Provider - Web3 provider or remote/local ethereum node.
   * @param {DataStore} _dataStore - the data store that BlockDataService will use to access and persist block data.
   */
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
   * CLoses the connection to the data store.
   */
  closeDataStore = () => {
    this.dataStore.closeConnection();
  };

  /**
   * Given a valid block number returns the data for that block
   * @param {number} _blockNumber - The number of the block to retrieve data for.
   * @returns {Object} - The block data or null if no data retrieved.
   */
  getBlockData = async (_blockNumber) => {
    // First attempt to retrieve the block data from our data store and then, if the data store
    // does not hold the data retrieve the block data directly from the network and persist the
    // block data in the data store for next time.
    let block = await this.dataStore.retrieveBlockData(_blockNumber);
    if (!block) {
      try {
        block = await this.web3.eth.getBlock(_blockNumber, true);
      } catch (error) {
        throw new Web3Error(error.message, 'eth.getBlock');
      }
      this.dataStore.storeBlockData(block);
    }
    return block;
  };
}

module.exports = BlockDataService;
