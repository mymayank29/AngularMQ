/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
const assert = require('assert').strict;
const fs = require('fs');
const { parsedObjs } = require('./parsedObjects');
const { getCvssIndex } = require('../src/titleParse');
const { readPDF } = require('../src/pdfExtract');

const runFile = (fileURL) => new Promise((res, rej) => {
  getCvssIndex(fileURL).then(cvssFiles => {
    Promise.all(cvssFiles.map(pageNumber => readPDF(fileURL, pageNumber))).then(
      cvssData => {
        const fileData = cvssData.reduce((output, current) => {
          output[current.itemtag] = current;
          return output;
        }, {});
        res(fileData);
      },
    ).catch(err => rej(err));
  });
});


describe('Parse Document', function () {
  describe('Parse PDFs', function () {
    this.timeout(7000);
    it('should parse all PDFs with CVSS sheets', function (done) {
      const testDir = fs.readdirSync('/home/jelani/Documents/chevron/ETC-TC-DSTD-GOM-MQP/test-source');
      Promise.all(testDir.map(filePath => runFile(`/home/jelani/Documents/chevron/ETC-TC-DSTD-GOM-MQP/test-source/${filePath}`))).then(
        outputs => {
          const testObjs = outputs.reduce((output, current) => {
            Object.keys(current).forEach(key => {
              output[key] = current[key];
            });
            return output;
          }, {});
          Object.keys(parsedObjs).forEach(function (key) {
            Object.keys(parsedObjs[key]).forEach(function (cvssKey) {
              assert.equal(parsedObjs[key][cvssKey], testObjs[key][cvssKey]);
            });
          });
          done();
        },
      );
    });
  });
});
