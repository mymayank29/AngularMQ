const { readPDF } = require('./pdfExtract');
const { writeToCSV } = require('./writeCSV');
const { getCvssIndex } = require('./titleParse');
const {
  cvssHelpers,
  anchorHelpers,
  vendorFileDataHelpers
} = require('./database/helpers');
const { parseXLSX } = require('./xlsxExtract');
const { findAndCompare } = require('./compare');

const { createCVSSEntry, findAllCVSSEntries } = cvssHelpers;
const { createVendorFileEntry, findVendorFileByJSON } = vendorFileDataHelpers;
const { createAnchorEntry } = anchorHelpers;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const runFile = async fileURL => {
  const fileSplit = fileURL.split('.');
  const fileType = fileSplit[fileSplit.length - 1];
  try {
    if (fileType && fileType === 'pdf') {
      const allCVSSEntries = await findAllCVSSEntries();
      const allCVSSTags = allCVSSEntries.map(cvssData => cvssData.itemtag);
      const cvssFiles = await getCvssIndex(fileURL);
      const fileData = await Promise.all(
        cvssFiles.map(async pageNumber => {
          const cvssData = await readPDF(fileURL, pageNumber);
          cvssData.itemtag = cvssData.itemtag.replace(/ /g, '');
          return cvssData;
        })
      );
      const existingFileData = await findVendorFileByJSON(
        JSON.stringify(fileData)
      );

      if (!existingFileData) {
        fileData.forEach(async cvssData => {
          const { itemtag } = cvssData;
          if (!allCVSSTags.includes(cvssData.itemtag)) {
            await createCVSSEntry(cvssData);
            // logFileReport(
            //   JSON.stringify({ fileName: fileURL, pageNumber, fileData }),
            // );
            await writeToCSV(cvssData);
            findAndCompare(itemtag);
          } else {
            console.log('CVSS entry already exists');
          }
        });
        return createVendorFileEntry(fileData, 'success');
      } else {
        console.log('File Data Exist');
        return { error: [409, 'File Data Already Entered'] };
      }
    }
    if (fileType && fileType === 'xlsx') {
      const fileData = await parseXLSX(fileURL);
      Object.keys(fileData).forEach(sheet => {
        Object.keys(fileData[sheet]).forEach(async ANCREntry => {
          if (fileData[sheet][ANCREntry].itemtag) {
            fileData[sheet][ANCREntry].itemtag = fileData[sheet][
              ANCREntry
            ].itemtag.replace(/ /g, '');
            await createAnchorEntry(fileData[sheet][ANCREntry]);
            findAndCompare(fileData[sheet][ANCREntry].itemtag);
          }
        });
      });
      // logFileReport(JSON.stringify({ fileName: fileURL, fileData }));
    }
  } catch (error) {
    console.log(error, fileURL);
  }
};

module.exports = { runFile };
