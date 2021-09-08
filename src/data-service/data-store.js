/**
 * Class (abstract) to define an interface for a DataStore.
 * This class should be extended and the class methods implemented.
 */
class DataStore {
  /**
   * When implemented this method should retrieve the data for a given block from the data store or return null.
   * @param {number} _blockNumber - the number of the block whose data we wish to retrieve.
   */
  retreiveBlockData = (_blockNumber) => {
    throw new Error('Abstract method.');
  };

  /**
   * When implemented this method should store the block data in the data store.
   * @param {Object} _blockData
   */
  storeBlockData = (_blockData) => {
    throw new Error('Abstract method.');
  };

  /**
   * When implemented this method should close the connection to the data store.
   */
  closeConnection = () => {
    throw new Error('Abstract method.');
  };
}

module.exports = DataStore;
