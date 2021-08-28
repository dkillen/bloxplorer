/**
 * Error class for errors encountered uaing Web3 RPCs
 */
class Web3Error extends Error {
  constructor(message, method) {
    const msg = `An error occured when calling ${method}. Error message: ${message}`;
    super(msg);
    this.method = method;
  }
  get name() {
    return 'Web3Error';
  }
}

module.exports = Web3Error;
