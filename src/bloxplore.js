const Web3 = require('web3');

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
   * @param  {...number} params - A single positive integer (offset), or two positive integers (starting and ending block numbers).
   * @returns {boolean} - Success or failure
   */
  getBlockData = async (...params) => {
    /**
     * Save away the number of parameters to help with parameter checks and
     * store the parameters in an array that can be modified.
     */
    let parameterCount = params.length;
    // const params = [...args];

    // Get the current block number
    const currentBlock = await this.web3.eth.getBlockNumber();

    /**
     * Check parameters. If no parameter supplied, more than two parameters supplied, or
     * one parameter with a value of 0 then get the current block.
     */
    if (
      parameterCount === 0 ||
      parameterCount > 2 ||
      (parameterCount === 1 && params[0] === 0)
    ) {
      parameterCount = 1;
      params[0] = 1;
      console.log(
        'Error: Method getBlockData: Incorrect number of arguments. Getting data for the current block.'
      );
    }

    // Check parameters when two suppied. They cannot be greater than the current block number.
    if (
      parameterCount === 2 &&
      (params[0] > currentBlock || params[1] > currentBlock)
    ) {
      // Handle error
    }

    // Ensure that all arguments are a number or can be parsed to a number.
    for (let param of params) {
      if (typeof param !== 'number') {
        console.error(
          'Error: Method getBlockData: Argument(s) must be a number!'
        );
        return false;
      }
    }

    /**
     * If a single parameter with the value of 1 get the data for the current block.
     * If a single parameter is greater than 1 it is an offset from the current block so calculate
     * the range where the starting block is currentBlock - (offset - 1).
     */
    if (parameterCount === 1) {
      if (params[0] === 1) {
        this.blockData = await this.web3.eth
          .getBlock(currentBlock, true)
          .catch((e) => {
            console.log;
          });
        this._processTransactions(this.blockData.transactions);
      } else {
        const startBlock = currentBlock - (params[0] - 1);
        this.blockData = await this._getBlocks(startBlock, currentBlock);
      }
    } else {
      // If two arguments are passed in get the data for that range of blocks.
      this.blockData = await this._getBlocks(params[0], params[1]);
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
   * @returns {Array} - Objects representing a receiving address and value of ether transferred.
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
    const code = await this.web3.eth.getCode(address);
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
  _processTransactions(transactions) {
    for (let transaction of transactions) {
      this.transactions.push(transaction);
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
      const block = await this.web3.eth.getBlock(i, true).catch((e) => {
        console.log;
      });
      blockData.push(block);
      this.unclesCount += block.uncles.length;
      this._processTransactions(block.transactions);
    }
    return blockData;
  };
}

module.exports = Bloxplore;
