const DataStore = require('./data-store');
const sqlite3 = require('sqlite3').verbose();

/**
 * SQLiteDataStore implements a data store using a SQLite database. It extends DataStore and overrides its methods
 */
class SQLiteDataStore extends DataStore {
  /**
   *SQLiteDataStore constructor - opens a connection  to the given SQLite database file.
   * @param {string} _dbfilePath - full path to a sqlite3 database file.
   */
  constructor(_dbfilePath) {
    super();
    this.db = new sqlite3.cached.Database(
      _dbfilePath,
      sqlite3.OPEN_READWRITE,
      (error) => {
        if (error) {
          return console.error(error.message);
        }
        console.log('Connected to the database');
      }
    );
  }

  /**
   * Retrieves the block data for a given block
   * @param {number} _blockNumber - the number of the block
   * @returns {Object||null} - returns an object containing the block data or null if there is no data for the block.
   */
  retrieveBlockData = (_blockNumber) => {
    return null;
  };

  /**
   * Stores the data for block in the data store
   * @param {Object} _blockData - the block data to store in the data store
   */
  storeBlockData = (_blockData) => {};

  /**
   * Close the connection to the SQLite database.
   */
  closeConnection = () => {
    this.db.close((error) => {
      if (error) {
        return console.error(error.message);
      }
      console.log('Closed the database connection.');
    });
  };
}

module.exports = SQLiteDataStore;
