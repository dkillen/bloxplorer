require('dotenv').config();
const Bloxplore = require('./src/bloxplore');

const startingBlock = 13042603;
const endingBlock = 13042610;

const bloxplorer = new Bloxplore(process.env.INFURA_ENDPOINT);
console.log(
  'Getting your reports. Please be patient, this could take a while.'
);
bloxplorer.getBlockData(startingBlock, endingBlock).then((result) => {
  if (result) {
    const statistics = [
      {
        Description: 'Total value of ether transferred',
        Value: bloxplorer.totalEtherTransferred,
      },
      {
        Description: 'Number of unique addresses sent a transaction',
        Value: bloxplorer.sendingAddresses.size,
      },
      {
        Description: 'Number of unique addresses received a transaction',
        Value: bloxplorer.receivingAddresses.size,
      },
      {
        Description: 'Number of contracts created',
        Value: bloxplorer.contractsCreated,
      },
      {
        Description: 'Number of uncles created',
        Value: bloxplorer.unclesCount,
      },
    ];

    console.log('\n--== Statistics ==--\n');
    console.table(statistics);

    bloxplorer.getSendersReport().then((report) => {
      console.log('\n--== Ether Senders Report ==--\n');
      console.table(report);
    });
    bloxplorer.getReceiversReport().then((report) => {
      console.log('\n--== Ether Receivers Report ==--\n');
      console.table(report);
    });
  }
});
