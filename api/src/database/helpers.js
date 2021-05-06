const {
  ControlValveSpecSheet,
  AnchorSheet,
  Comparison,
  sequelize,
  CVSSComparisons,
  VendorFileData
} = require('../database');

const models = {
  Comparison,
  ControlValveSpecSheet,
  AnchorSheet,
  CVSSComparisons,
  VendorFileData
};

const create = async (model, item) => models[model].create(item);

const update = async (model, where, newItem) =>
  models[model].update(newItem, where);

const destroy = async (model, options) => {
  if (options) {
    return models[model].destroy(options);
  }
  return models[model].destroy({ truncate: true });
};

const findOne = async (model, where) => models[model].findOne(where);

const findAll = async (model, where) => {
  try {
    if (where) {
      return (await models[model].findAll(where)).map(item => item.dataValues);
    }
    return (await models[model].findAll()).map(item => item.dataValues);
  } catch (err) {
    console.log(err);
  }
};

const cvssHelpers = {
  findAllCVSSByTag: async itemtag => {
    const cvss = await findAll('ControlValveSpecSheet', { where: { itemtag } });
    if (cvss) {
      return cvss;
    }
    return cvss;
  },
  findCVSSByID: async id => {
    const cvss = await findAll('ControlValveSpecSheet', { where: { id } });
    if (cvss) {
      return cvss[0];
    }
    return cvss;
  },
  findAllCVSSEntries: async () => findAll('ControlValveSpecSheet'),
  createCVSSEntry: cvssData =>
    create('ControlValveSpecSheet', {
      itemtag: cvssData.itemtag,
      dataJSON: JSON.stringify(cvssData)
    }),
  updateCVSSEntry: async newFileData => {
    const updatedResource = { ...newFileData };
    updatedResource.dataJSON = JSON.stringify(newFileData);
    return update(
      'ControlValveSpecSheet',
      { where: { itemtag: newFileData.itemtag } },
      updatedResource
    );
  }
};

const vendorFileDataHelpers = {
  findVendorFileByJSON: async fileDataJSON =>
    findOne('VendorFileData', { where: { fileDataJSON } }),
  findVendorFileByID: async id => findOne('VendorFileData', { where: { id } }),
  findAllVendorFileEntries: async () => findAll('VendorFileData'),
  createVendorFileEntry: (fileData, status) =>
    create('VendorFileData', {
      status,
      fileDataJSON: JSON.stringify(fileData)
    })
};

const cvssComparisonHelpers = {
  findAllCVSSComparisonsByCVSS: async cvssId => {
    const cvssComparison = await findAll('CVSSComparisons', {
      where: { cvssId }
    });
    if (cvssComparison) {
      return cvssComparison;
    }
    return cvssComparison;
  },
  findAllCVSSComparisonsByCompId: async comparisonId => {
    const cvssComparison = await findAll('CVSSComparisons', {
      where: { comparisonId }
    });
    if (cvssComparison) {
      return cvssComparison;
    }
    return cvssComparison;
  },
  findCVSSComparisonByID: async id => {
    const cvssComparison = await findAll('CVSSComparisons', { where: { id } });
    if (cvssComparison) {
      return cvssComparison[0];
    }
    return cvssComparison;
  },
  findAllCVSSComparisonEntries: async () => findAll('CVSSComparisons'),
  createCVSSComparisonEntry: (cvssId, comparisonId) =>
    create('CVSSComparisons', { cvssId, comparisonId }),
  updateCVSSComparisonEntry: async (id, cvssId, comparisonId) => {
    return update(
      'CVSSComparisons',
      { where: { id } },
      { cvssId, comparisonId }
    );
  }
};

const anchorHelpers = {
  createAnchorEntry: fileData =>
    create('AnchorSheet', {
      itemtag: fileData.itemtag,
      dataJSON: JSON.stringify(fileData)
    }),
  updateAnchorEntry: async newFileData => {
    const updatedResource = { ...newFileData };
    updatedResource.dataJSON = JSON.stringify(newFileData);
    return update(
      'AnchorSheet',
      { where: { itemtag: newFileData.itemtag } },
      updatedResource
    );
  },
  findAllAnchorsByTag: async itemtag => {
    const anchors = await findAll('AnchorSheet', { where: { itemtag } });
    if (anchors) {
      return anchors;
    }
    return anchors;
  },
  findAnchorByID: async id => {
    const anchors = await findAll('AnchorSheet', { where: { id } });
    if (anchors) {
      return anchors[0];
    }
    return anchors;
  },
  findAllAnchorEntries: async () => findAll('AnchorSheet')
};

const comparisonHelpers = {
  createComparisonEntry: (
    itemtag,
    comparisonDataJSON,
    control_valve_spec_sheets,
    anchorid
  ) => {
    return Comparison.create({
      itemtag,
      comparisonDataJSON,
      anchorid
    }).then(async comparison => {
      const { itemtag } = comparison.dataValues;
      const existingEntries = await ControlValveSpecSheet.findAll({
        where: { itemtag }
      });
      existingEntries.forEach(cvssEntry => {
        cvssComparisonHelpers.createCVSSComparisonEntry(
          cvssEntry.dataValues.id,
          comparison.dataValues.id
        );
      });
    });
  },
  updateComparisonEntry: async (
    itemtag,
    comparisonDataJSON,
    cvss,
    anchorid
  ) => {
    const updatedResource = { itemtag, comparisonDataJSON, cvss, anchorid };
    return update('Comparison', { where: { itemtag } }, updatedResource);
  },
  findComparisonByTag: async itemtag => {
    const comparison = findOne('Comparison', { where: { itemtag } });
    if (comparison) {
      return comparison;
    }
    return comparison;
  },
  findAllComparisonEntries: async () => findAll('Comparison')
};

(async () => {
  try {
    sequelize.sync({ force: process.env.DB_SYNC === 'true' }).catch(err => console.log(err));
    await sequelize.authenticate();

    // await destroy('CVSSComparisons', { truncate: { cascade: true } });
    // await destroy('Comparison', { truncate: { cascade: true } });
    // await destroy('ControlValveSpecSheet', { truncate: { cascade: true } });
    // await destroy('VendorFileData', { truncate: { cascade: true } });
    // await destroy('AnchorSheet', { truncate: { cascade: true } });
    console.log('Connection has been established successfully.');
    // (async () => console.log(await cvssHelpers.findAllCVSSEntries()))();
    // (async () =>
    // console.log(
    // await cvssComparisonHelpers.findAllCVSSComparisonEntries()
    // ))();
    // (async () => console.log(await anchorHelpers.findAllAnchorEntries()))();
    // (async () =>
    // console.log(await comparisonHelpers.findAllComparisonEntries()))();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = {
  vendorFileDataHelpers,
  cvssHelpers,
  cvssComparisonHelpers,
  comparisonHelpers,
  anchorHelpers,
  destroy
};
