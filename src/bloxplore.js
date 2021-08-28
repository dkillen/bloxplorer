const Web3 = require('web3');
const Web3Error = require('./errors');

/**
 * Class encapsulating Ethereum block data and methods to manipulate and analyse that data.
 */
class Bloxplore {
  /**
   * Create an instance of the Bloxplore class.
   * @param {string} _provider - Web3 provider or remote/local ethereum node.
   */
  constructor(_provider) {
    this.web3 = new Web3(_provider);

    // Array of Objects representing a block's data
    this.blockData = [];

    // Array of Objects representing all transactions in all blocks
    this.transactions = [];

    // Maps of addresses to values
    this.sendingAddresses = new Map();
    this.receivingAddresses = new Map();
    this.contractAddresses = new Set();

    // Block statistics
    this.contractsCreated = 0;
    this.totalEtherTransferred = 0;
    this.unclesCount = 0;
  }

  /**
   * Returns the data of a block or for a range of blocks.
   * @param  {...number} params - A single positive integer or zero (offset), or two positive integers (starting and ending block numbers).
   * When a single parameter is supplied it acts like a zero based array in that zero represents the current block. A parameter of n will
   * get n+1 blocks - the current block and n block(s) before it.
   * @returns {boolean} - success or failure
   */
  getBlockData = async (...params) => {
    // Save away the number of parameters to help with parameter checks.
    let parameterCount = params.length;

    // Get the current block number
    let currentBlock = 0;
    try {
      currentBlock = await this.web3.eth.getBlockNumber();
    } catch (error) {
      this._handleWeb3Error(error, 'eth.getBlockNumber');
    }

    /**
     * Check parameters. If no parameter supplied, more than two parameters supplied, or
     * one parameter with a value of 0 then get the current block.
     */
    if (parameterCount === 0 || parameterCount > 2) {
      parameterCount = 1;
      params[0] = 0;
      console.log(
        'Error: Method getBlockData: Incorrect number of parameters. Getting data for the current block instead.'
      );
    }

    // Ensure that all arguments are a number or can be parsed to a number.
    if (parameterCount === 1) {
      params[0] = parseInt(params[0]);
      if (isNaN(params[0])) {
        params[0] = 0;
        console.log(
          'Error: Method getBlockData: Invalid parameter. Getting data for the current block instead.'
        );
      }
    } else {
      params[0] = parseInt(params[0]);
      params[1] = parseInt(params[1]);
      if (isNaN(params[0]) || isNaN(params[1])) {
        parameterCount = 1;
        params[0] = 0;
        console.log(
          'Error: Method getBlockData: Invalid parameter. Getting data for the current block instead.'
        );
      }
    }

    // Check parameters when two suppied. They cannot be greater than the current block number.
    if (
      parameterCount === 2 &&
      (params[0] > currentBlock || params[1] > currentBlock)
    ) {
      parameterCount = 1;
      params[0] = 0;
      console.log(
        'Error: Method getBlockData: Out of bounds - parameter greater than the current block number. Getting data for the current block instead.'
      );
    }

    /**
     * If a single parameter with the value of 1 get the data for the current block.
     * If a single parameter is greater than 1 it is an offset from the current block so calculate
     * the range where the starting block is currentBlock - (offset - 1).
     */
    if (parameterCount === 1) {
      if (params[0] === 0) {
        try {
          this.blockData = await this.web3.eth.getBlock(currentBlock, true);
        } catch (error) {
          this._handleWeb3Error(error, 'eth.getBlock');
        }
        this.transactions.push(...this.blockData.transactions);
        this._processTransactions();
      } else {
        const startBlock = currentBlock - params[0];
        this.blockData = await this._getBlocks(startBlock, currentBlock);
        this._processTransactions();
      }
    } else {
      // If two arguments are passed in get the data for that range of blocks.
      this.blockData = await this._getBlocks(params[0], params[1]);
      this._processTransactions();
    }
    return true;
  };

  /**
   * Returns a sending address transaction report - for use with console.table() to output a formatted table of data.
   * @returns {Array} - Objects representing a sending address and value of ether transferred.
   */
  getSendersReport = async () => {
    const sendersReport = [];
    for (let [key, value] of this.sendingAddresses) {
      const isContractAddress = await this._isContractAddress(key);
      if (isContractAddress) {
        sendersReport.push({
          address: key,
          sent: value,
          contract: isContractAddress,
        });
      } else {
        sendersReport.push({
          address: key,
          sent: value,
          contract: isContractAddress,
        });
      }
    }
    return sendersReport;
  };

  /**
   * Returns a receiving address transaction report - for use with console.table() to output a formatted table of data.
   * @returns {Array} - Objects representing a receiving address, value of ether transferred, and contract boolean.
   */
  getReceiversReport = async () => {
    const receiversReport = [];
    for (let [key, value] of this.receivingAddresses) {
      const isContractAddress = await this._isContractAddress(key);
      if (isContractAddress) {
        receiversReport.push({
          address: key,
          received: value,
          contract: isContractAddress,
        });
      } else {
        receiversReport.push({
          address: key,
          received: value,
          contract: isContractAddress,
        });
      }
    }
    return receiversReport;
  };

  /**
   * Determines whether an address is a contract based on whether the getCode web3.eth.getCode() any code associated with the address or '0x'.
   * @param {string} address - the address to query.
   * @returns {boolean} - true if the address is a contract otherwise false.
   */
  _isContractAddress = async (address) => {
    let code;
    try {
      code = await this.web3.eth.getCode(address);
    } catch (error) {
      this._handleWeb3Error(error, 'eth.getCode');
    }
    if (code !== '0x' && !this.contractAddresses.has(address)) {
      this.contractAddresses.add(address);
      return true;
    }
    return false;
  };

  /**
   * Processes an array of transactions to extract the data and set instance properties.
   * @param {Array} transactions - The transactions to process for their data.
   */
  _processTransactions() {
    for (let transaction of this.transactions) {
      const sender = transaction.from;
      const receiver = transaction.to;

      /**
       * If the receiving address is null, this is a contract creation so increment the
       * contracts created counter, otherwise process the transaction.
       */
      if (receiver === null) {
        this.contractsCreated++;
      } else {
        let transactionValue = parseFloat(
          this.web3.utils.fromWei(transaction.value, 'ether')
        );

        // Skip over any transactions where no value was transferred.
        if (transactionValue === 0) {
          continue;
        }

        // Update total ether transferred
        this.totalEtherTransferred += transactionValue;

        //If the sending address is already known update the total for that address otherwise add it to the sendingAddresses map.
        if (this.sendingAddresses.has(sender)) {
          const updatedValue =
            this.sendingAddresses.get(sender) + transactionValue;
          this.sendingAddresses.set(sender, updatedValue);
        } else {
          this.sendingAddresses.set(sender, transactionValue);
        }

        // If the receiving address is already known update the total for that address otherwise add it to the receivingAddresses map.
        if (this.receivingAddresses.has(receiver)) {
          const updatedValue =
            this.receivingAddresses.get(receiver) + transactionValue;
          this.receivingAddresses.set(receiver, updatedValue);
        } else {
          this.receivingAddresses.set(receiver, transactionValue);
        }
      }
    }
  }

  /**
   * Returns block data for a range of blocks including the starting and ending blocks.
   * @param {number} _startBlock - The block number of the starting block of the range.
   * @param {number} _endBlock - The block number of the ending block of the range.
   * @returns {Array} - The block data for a block or range of blocks.
   */
  _getBlocks = async (_startBlock, _endBlock) => {
    let blockData = [];
    for (let i = _startBlock; i <= _endBlock; i++) {
      let block;
      try {
        block = await this.web3.eth.getBlock(i, true);
      } catch (error) {
        this._handleWeb3Error(error, 'eth.getBlock');
      }
      blockData.push(block);
      this.unclesCount += block.uncles.length;
      this.transactions.push(...block.transactions);
    }
    return blockData;
  };

  /**
   * Hnadler for errors thrown by Web3 methods
   * @param {Object} error - the error object.
   * @param {string} method - the name of the method called.
   */
  _handleWeb3Error = (error, method) => {
    throw new Web3Error(error.message, method);
  };
}

module.exports = Bloxplore;
