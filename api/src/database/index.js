/* eslint-disable max-classes-per-file */

const { Sequelize, DataTypes, Model } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();
const { POSTGRESDB } = process.env;
console.log(POSTGRESDB);

const sequelize = new Sequelize(POSTGRESDB, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
  },
  //schema: process.env.DB_SCHEMA,
  logging: false,
  define: {
    freezeTableName: true
  }
});

// const sequelize = new Sequelize(POSTGRESDB, {
//     native: false,
//     dialectOptions: {
//         options: { encrypt: true },
//         ssl: process.env.NODE_ENV === 'production'
//     }
// });

class ControlValveSpecSheet extends Model {}

ControlValveSpecSheet.init(
  {
    itemtag: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dataJSON: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'control_valve_spec_sheet'
  }
);

class VendorFileData extends Model {}

VendorFileData.init(
  {
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileDataJSON: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'vendor_file_data'
  }
);

class AnchorSheet extends Model {}

AnchorSheet.init(
  {
    itemtag: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dataJSON: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'anchor_sheet'
  }
);

class Comparison extends Model {}

Comparison.init(
  {
    itemtag: {
      type: DataTypes.STRING,
      allowNull: false
    },
    comparisonDataJSON: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'comparison'
  }
);

class CVSSComparisons extends Model {}
CVSSComparisons.init(
  {
    cvssId: DataTypes.INTEGER,
    comparisonId: DataTypes.INTEGER
  },
  {
    sequelize,
    modelName: 'cvss_comparisons'
  }
);

CVSSComparisons.belongsTo(ControlValveSpecSheet, { foreignKey: 'cvssId' });
CVSSComparisons.belongsTo(Comparison, { foreignKey: 'comparisonId' });

ControlValveSpecSheet.belongsToMany(Comparison, {
  through: 'cvss_comparisons',
  foreignKey: 'cvssId',
  as: 'cvss'
});
Comparison.belongsToMany(ControlValveSpecSheet, {
  through: 'cvss_comparisons',
  foreignKey: 'comparisonId',
  as: 'comparisons'
});
AnchorSheet.hasOne(Comparison, {
  foreignKey: {
    name: 'anchorid',
    allowNull: false
  }
});

module.exports = {
  ControlValveSpecSheet,
  AnchorSheet,
  sequelize,
  Comparison,
  VendorFileData,
  CVSSComparisons
};
