const {
  cvssHelpers,
  anchorHelpers,
  comparisonHelpers
} = require('./database/helpers');

const { findAllAnchorsByTag } = anchorHelpers;
const { findAllCVSSByTag } = cvssHelpers;
const { findComparisonByTag, createComparisonEntry } = comparisonHelpers;
const compare = (val1, val2) => val1 === val2;

const compareStrNum = (str, num) => str == num;

const comparisonUtil = {
  flowratemax: compareStrNum,
  flowratemin: compareStrNum,
  flowratenorm: compareStrNum,
  flowrateuom: compare,
  pressuredropmax: compareStrNum,
  pressuredropmin: compareStrNum,
  pressuredropnorm: compareStrNum,
  pressuredropuom: compare,
  intempmax: compareStrNum,
  intempnorm: compareStrNum,
  intempmin: compareStrNum,
  intempuom: compare,
  packingmatl: compare,
  packingtype: compare,
  trimtype: compare,
  trimcharacter: compare,
  leakageclass: (cvss, anchor) => cvss.split('ANSI CL ')[1] === anchor
};

const reduceLatestEntry = (latest, current) => {
  if (latest === {}) {
    return current;
  }
  if (latest.updatedAt.getTime() > current.updatedAt.getTime()) {
    return latest;
  }
  return current;
};

const compareData = (cvssData, anchorData) =>
  Object.keys(comparisonUtil).reduce((output, key) => {
    if (!cvssData[key] && !anchorData[key]) {
      output[key] = true;
      return output;
    }
    output[key] = !!comparisonUtil[key](cvssData[key], anchorData[key]);
    return output;
  }, {});

const findAndCompare = async itemtag => {
  try {
    const allAnchor = await findAllAnchorsByTag(itemtag);
    const allCVSS = await findAllCVSSByTag(itemtag);
    if (!allAnchor.length) {
      console.log('No matching Anchor data');
      return;
    }
    if (!allCVSS.length) {
      console.log('No matching CVSS data');
      return;
    }
    const latestAnchor = allAnchor.reduce(reduceLatestEntry);
    const comparison = await findComparisonByTag(itemtag);
    const cvssDataArr = allCVSS.map(cvssEntry =>
      JSON.parse(cvssEntry.dataJSON)
    );
    const latestAnchorData = JSON.parse(latestAnchor.dataJSON);
    const comparisons = cvssDataArr.map(cvssEntry =>
      compareData(cvssEntry, latestAnchorData)
    );
    const comparisonsJSON = JSON.stringify(comparisons);
    if (!comparison) {
      return createComparisonEntry(
        itemtag,
        comparisonsJSON,
        allCVSS,
        latestAnchor.id
      );
    }
    console.log('Comparison already exists');
  } catch (err) {
    console.log(err);
  }
};

module.exports = { findAndCompare };
