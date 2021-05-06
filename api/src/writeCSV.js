const { BlobServiceClient } = require('@azure/storage-blob');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { AZURE_STORAGE_CONNECTION_STRING } = process.env;

const writeToCSV = async data => {
  let csvData = '';
  const blobServiceClient = await BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = await blobServiceClient.getContainerClient(
    'output-csv'
  );
  let columns = null;
  const csvFile = `${data.itemtag}.csv`;
  const blockBlobClient = containerClient.getBlockBlobClient(csvFile);

  if (data.itemtag) {
    columns = ['itemtag'].concat(
      Object.keys(data)
        .slice(1)
        .sort()
    );
    csvData += columns.join(',');
    let csvString = '';
    columns.forEach(column => {
      if (data[column]) {
        csvString += `${data[column]},`;
      } else {
        csvString += ' ,';
      }
    });
    csvData += `\n ${csvString}`;
    await blockBlobClient.upload(csvData, csvData.length);
  } else {
    throw new Error('no table data');
  }
};

module.exports = {
  writeToCSV
};
