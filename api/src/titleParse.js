/**
 * The title parser takes a multiform input as source
 * for each page check if first item is target title
 * make list of Cvss form page numbers available
 * Cvss = Control Valve Specification Sheet
 */

const pdfjs = require('pdfjs-dist');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const isCvss = page =>
  page.getTextContent().then(content => {
    const titleLine = content.items[0].str
      .toLowerCase()
      .split(' ')
      .join('')
      .trim();
    if (titleLine === 'controlvalvesspecificationsheet') {
      return true;
    }
    const titleLine2 = content.items[1].str
      .toLowerCase()
      .split(' ')
      .join('')
      .trim();
    if (titleLine2 === 'controlvalvesspecificationsheet') {
      return true;
    }
    return false;
  });

const findCvss = async (pdf, numPages) => {
  const listOfTargets = [];
  for (let i = 1; i < numPages; i++) {
    const page = pdf.getPage(i).then(async page => {
      const isTarget = await isCvss(page);
      if (isTarget) {
        return i;
      }
      return null;
    });
    listOfTargets.push(page);
  }
  return Promise.all(listOfTargets);
};

const getCvssIndex = filePath =>
  pdfjs
    .getDocument(filePath)
    .promise.then(async data => {
      const listOfTargets = await findCvss(data, data.numPages);
      return listOfTargets.filter(Boolean);
    })
    .catch(err => console.log(err));

module.exports = {
  getCvssIndex
};
