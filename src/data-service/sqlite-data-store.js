const DataStore = require('./data-store');
const sqlite3 = require('sqlite3').verbose();

/**
 * SQLiteDataStore implements a data store using a SQLite database. Extends the DataStore class and overrides its methods.
 */
class SQLiteDataStore extends DataStore {
  /**
   *SQLiteDataStore constructor - opens a connection  to the given SQLite database file.
   * @param {string} _dbfilePath - full path to a sqlite3 database file.
   */
  constructor(_dbfilePath) {
    super();
    this.dbfilePath = _dbfilePath;
    this.db = new sqlite3.cached.Database(_dbfilePath);
    this._createTables();

    // Custom sqlite database get query that allows the use of async/await syntax
    this.db.getQuery = (sql, params) => {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve({ row: row });
          }
        });
      });
    };

    // Custom sqlite database all query that allows the use of async/await syntax
    this.db.allQuery = (sql, params) => {
      let that = this;
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows: rows });
          }
        });
      });
    };
  }

  /**
   * Retrieves the block data for a given block.
   * Overriden DataStore class method.
   * @param {number} _blockNumber - the number of the block
   * @returns {Object} - returns an object containing the block data or null if there is no data for the block.
   */
  retrieveBlockData = async (_blockNumber) => {
    // SQL queries to retrieve block data from the data store.
    const blockDataQuery = `SELECT * FROM blocks WHERE block_number = ?`;
    const unclesQuery = `SELECT * FROM uncles WHERE block_number = ?`;
    const transactionsQuery = `SELECT * FROM transactions WHERE block_number = ?`;

    const data = await this.db.getQuery(blockDataQuery, [_blockNumber]);
    const transactions = await this.db.allQuery(transactionsQuery, [
      _blockNumber,
    ]);
    const uncles = await this.db.allQuery(unclesQuery, [_blockNumber]);

    // This is where we will compile our block data
    let blockData = {};

    // If there is no data for the block in the data store then return null.
    // The data must be retrieved directly from the network.
    if (typeof data.row === 'undefined') {
      return null;
    }

    // Store block data
    blockData = data.row;

    // Store data of the transactions included in the block
    blockData['transactions'] = [];
    transactions.rows.forEach((row) => {
      const transaction = {
        hash: row.hash,
        block_number: row.block_number,
        to: row.to_addr,
        from: row.from_addr,
        value: row.value,
      };
      blockData['transactions'].push(transaction);
    });

    // Store the data of the uncles included in the block.
    blockData['uncles'] = [];
    uncles.rows.forEach((row) => {
      blockData['uncles'].push(row.hash);
    });
    return blockData;
  };

  /**
   * Stores the data for block in the data store. Presently this persists only a subset of the block data.
   * Overriden DataStore class method.
   * @param {Object} _blockData - the block data to store in the data store
   * @returns {boolean} - returns true when complete
   */
  storeBlockData = (_blockData) => {
    const blockNumber = _blockData.number;
    const blockHash = _blockData.hash;
    const uncles = _blockData.uncles;
    const transactions = _blockData.transactions;

    // SQL queries to insert the block data into the database.
    const insertBlockDataSql = `INSERT INTO blocks(block_number, hash, transaction_count, uncles_count) VALUES(?,?,?,?)`;
    const insertTransactionsData = `INSERT INTO transactions(block_number, hash, to_addr, from_addr, value) VALUES(?,?,?,?,?)`;
    const insertUnclesData = `INSERT INTO uncles(block_number, hash) VALUES(?,?)`;

    // Persist the block data.
    const blockData = [
      blockNumber,
      blockHash,
      transactions.length,
      uncles.length,
    ];
    this.db.run(insertBlockDataSql, blockData);

    // Persist the transaction data.
    if (transactions.length > 0) {
      let transactionData;
      transactions.forEach((transaction) => {
        transactionData = [
          blockNumber,
          transaction.hash,
          transaction.to,
          transaction.from,
          transaction.value,
        ];
        this.db.run(insertTransactionsData, transactionData);
      });
    }

    // Persist the uncles data.
    if (uncles.length > 0) {
      let unclesData;
      uncles.forEach((uncle) => {
        unclesData = [blockNumber, uncle];
        this.db.run(insertUnclesData, unclesData);
      });
    }

    return true;
  };

  /**
   * Closes the connection to the database.
   * Overriden DataStore class method.
   */
  closeConnection = () => {
    this.db.close();
  };

  /**
   * Creates the necessary database tables if they do not already exist.
   * @returns {boolean} - true if connection established.
   */
  _createTables = (_dbfilePath) => {
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS blocks (
        block_number INTEGER PRIMARY KEY,
        hash TEXT NOT NULL,
        transaction_count INTEGER NOT NULL,
        uncles_count INTEGER NOT NULL
      ) WITHOUT ROWID`).run(`CREATE TABLE IF NOT EXISTS uncles (
        block_number INTEGER NOT NULL,
        hash TEXT PRIMARY KEY,
        FOREIGN KEY (block_number)
          REFERENCES blocks (block_number)
      ) WITHOUT ROWID`).run(`CREATE TABLE IF NOT EXISTS transactions (
        block_number INTEGER NOT NULL,
        hash TEXT PRIMARY KEY,
        to_addr TEXT NOT NULL,
        from_addr TEXT NOT NULL,
        value TEXT NOT NULL,
        FOREIGN KEY (block_number)
          REFERENCES blocks (block_number)
      ) WITHOUT ROWID`);
    });
    return true;
  };
}

module.exports = SQLiteDataStore;
