require('dotenv').config();
const Bloxplore = require('./src/bloxplore');

const startingBlock = 13042603;
const endingBlock = 13042610;

const bloxplorer = new Bloxplore(process.env.INFURA_ENDPOINT);
console.log(
  'Getting your reports. Please be patient, this could take a while.'
);
bloxplorer.getBlockData(1).then((result) => {
  if (result) {
    console.clear();
    const statistics = [
      {
        description: 'Total value of ether transferred',
        value: bloxplorer.totalEtherTransferred,
      },
      {
        description: 'Number of unique addresses sent a transaction',
        value: bloxplorer.sendingAddresses.size,
      },
      {
        description: 'Number of unique addresses received a transaction',
        value: bloxplorer.receivingAddresses.size,
      },
      {
        description: 'Number of contracts created',
        value: bloxplorer.contractsCreated,
      },
      {
        description: 'Number of uncles created',
        value: bloxplorer.unclesCount,
      },
    ];

    console.log('\n--== Block Statistics ==--\n');
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
