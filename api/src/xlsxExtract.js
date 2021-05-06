/* eslint-disable no-multi-assign */
/* eslint-disable no-param-reassign */
const XLSX = require('xlsx');
const https = require('https');

const parseXLSX = fileLocation =>
  new Promise((resolve, reject) => {
    const buffers = [];
    https
      .get(fileLocation, res => {
        res
          .on('data', d => {
            buffers.push(d);
          })
          .on('end', () => {
            console.log('END');
            const buffer = Buffer.concat(buffers);
            const contents = XLSX.read(buffer);
            const sheets = Object.keys(contents.Sheets);
            const keyDictionary = {};
            resolve(
              sheets.reduce((sheetObj, sheet) => {
                sheetObj[sheet] = {};
                Object.keys(contents.Sheets[sheet]).forEach(key => {
                  const regNums = /-?\d+/g.exec(key);
                  const regRepKey = key.replace(/[0-9]/g, '');
                  if (
                    Array.isArray(regNums) &&
                    parseInt(regNums[0], 10) === 1
                  ) {
                    keyDictionary[regRepKey] = contents.Sheets[sheet][key].v;
                  } else if (Array.isArray(regNums)) {
                    if (sheetObj[sheet][regNums[0]]) {
                      sheetObj[sheet][regNums[0]][keyDictionary[regRepKey]] =
                        contents.Sheets[sheet][key].v;
                    } else {
                      sheetObj[sheet][regNums[0]] = {};
                      sheetObj[sheet][regNums[0]][keyDictionary[regRepKey]] =
                        contents.Sheets[sheet][key].v;
                    }
                  }
                });
                return sheetObj;
              }, {})
            );
          });
      })
      .on('error', e => {
        console.error(e);
        reject(e);
      });
  });

module.exports = { parseXLSX };
