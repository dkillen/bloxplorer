require('dotenv').config();
const Bloxplore = require('./src/bloxplore');

const startingBlock = 13042603;
const endingBlock = 13042610;

const bloxplorer = new Bloxplore(process.env.INFURA_ENDPOINT);
bloxplorer.getBlockData(1).then((result) => {
  if (result) {
    console.log(`There were ${bloxplorer.contractsCreated} contracts created.`);
    console.log(
      `There were ${bloxplorer.sendingAddresses.size} unique addresses that sent a transaction.`
    );
    console.log(
      `There were ${bloxplorer.receivingAddresses.size} unique addresses that received a transaction.`
    );
    console.log(
      `There was ${bloxplorer.totalEtherTransferred} ether transferred in total.`
    );
    console.log(`There were ${bloxplorer.unclesCount} uncles.`);
    console.log('Ether Senders Report');
    console.table(bloxplorer.prepareSendersReport(), ['Address', 'Ether Sent']);
    console.log('Ether Receivers Report');
    console.table(bloxplorer.prepareReceiversReport(), [
      'Address',
      'Ether Received',
    ]);
    bloxplorer.findContractAddresses();
  }
});
