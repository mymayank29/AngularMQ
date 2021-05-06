/* eslint-disable no-param-reassign */

const handleMapping = (pageDataKeys, obj, mappingKeys) => {
  if (typeof pageDataKeys === 'string') {
    const output = {};
    output[mappingKeys] = obj[pageDataKeys];
    return output;
  }
  return mappingKeys.reduce((output, key, i) => {
    output[key] = obj[pageDataKeys[i]] ? obj[pageDataKeys[i]] : null;
    return output;
  }, {});
};

const handleMappingWithSplit = (
  lineObj,
  pageDataKey,
  splitPosition,
  mappingKeys
) => {
  const splitStr = lineObj[pageDataKey].split(splitPosition);
  if (splitPosition === '/' && splitStr.length === 3) {
    splitStr[1] += `/${splitStr[2]}`;
  }
  // catch errors
  if (['Fis her'].includes(splitStr[0])) {
    splitStr[0] = 'Fisher';
  }

  return mappingKeys.reduce((output, key, i) => {
    output[key] = splitStr[i] ? splitStr[i] : null;
    return output;
  }, {});
};

const handleSzSchedMap = (obj, pageDataKeys, mappingKeys) => {
  const output = {};
  const pageDataKey = pageDataKeys.filter(key => obj[key])[0];
  if (!obj[pageDataKey]) {
    output[mappingKeys[0]] = '';
    output[mappingKeys[1]] = '';
    return output;
  }
  const splitStr = obj[pageDataKey].split(',');
  output[mappingKeys[0]] = parseInt(splitStr[0].replace(/[^0-9.]+/g, ''), 10);
  output[mappingKeys[1]] = splitStr[1].substring(5);
  return output;
};

const handleEndCnnctMap = (obj, pageDataKeys, mappingKeys) => {
  const pageDataKey = pageDataKeys.filter(key => obj[key])[0];
  const finalOutput = {};
  if (!obj[pageDataKey]) {
    finalOutput[mappingKeys[0]] = '';
    finalOutput[mappingKeys[1]] = '';
    return finalOutput;
  }
  const splitStr = obj[pageDataKey].split(' ');
  finalOutput[mappingKeys[0]] = splitStr.reduce((output, item) => {
    if (output === '') {
      output += /\d/.test(item) ? item : '';
    } else {
      output += /\d/.test(item) ? ` ${item}` : '';
    }
    return output;
  }, '');
  finalOutput[mappingKeys[1]] = splitStr.reduce((output, item) => {
    if (output === '') {
      output += /\d/.test(item) ? '' : item;
    } else {
      output += /\d/.test(item) ? '' : ` ${item}`;
    }
    return output;
  }, '');
  return finalOutput;
};

const tableEdgeCaseMap = {
  'Vapor Pressure (Pv)': 0,
  'Vapor Pressure(Pv)': 0,
  'Dynamic Viscosity (Mu)': 1,
  'Dynamic Viscosity(Mu)': 1,
  'M / Gg': 1,
  'Specific heats ratio (gamma)': 1,
  SG: 1,
  '(Allowed / Calculated)': (obj, mappingKeys) =>
    Object.keys(obj).reduce(
      (output, key, i) => {
        const splitStr = obj[key].split('/');
        if (mappingKeys[0][i - 1] && !output[mappingKeys[1][i - 1]]) {
          [
            output[mappingKeys[0][i - 1]],
            output[mappingKeys[1][i - 1]]
          ] = splitStr;
        }
        return output;
      },
      { allowspluom: obj.Units, predictspluom: obj.Units }
    )
};
tableEdgeCaseMap['( Allowed / Calculated)'] =
  tableEdgeCaseMap['(Allowed / Calculated)'];
tableEdgeCaseMap['( Allowed/ Calculated)'] =
  tableEdgeCaseMap['(Allowed / Calculated)'];

const knownHeaders = ['Maximum', 'Normal', 'Minimum', 'Units'];

const handleTableDataMap = (obj, mappingKeys) => {
  if (Array.isArray(mappingKeys)) {
    const originHeaders = Object.keys(obj).filter(header =>
      knownHeaders.includes(header)
    );
    let mapIndex = null;
    originHeaders.forEach(header => {
      if (
        tableEdgeCaseMap[obj[header]] ||
        tableEdgeCaseMap[obj[header]] === 0
      ) {
        mapIndex = tableEdgeCaseMap[obj[header]];
      }
    });
    if (typeof mapIndex === 'function') {
      return mapIndex(obj, mappingKeys);
    }
    return originHeaders.reduce((output, key, i) => {
      if (!mappingKeys[mapIndex]) {
        return output;
      }
      if (mappingKeys[mapIndex][i - 1]) {
        output[mappingKeys[mapIndex][i - 1][key]] = obj[key];
      }
      return output;
    }, {});
  }
  return Object.keys(obj).reduce((output, key, i) => {
    if (mappingKeys[key] && knownHeaders.includes(key)) {
      output[mappingKeys[key]] = obj[key];
    }
    return output;
  }, {});
};

module.exports = {
  formatData: pageData => {
    if (pageData.otherData.itemtag === 'XXXXX') {
      console.log('ERROR PDF!');
      return { itemtag: pageData.otherData.itemtag };
    }
    const format = {
      topTable: {
        'Service Description': 'servicedesc'
      },
      1: objFrom1 => ({
        fluidname: objFrom1.type,
        criticalpress: objFrom1.Crit_Pres_PC.value,
        criticalpressuom: objFrom1.Crit_Pres_PC.units
      }),
      2: {
        Units: 'flowrateuom',
        Maximum: 'flowratemax',
        Normal: 'flowratenorm',
        Minimum: 'flowratemin'
      },
      3: {
        Units: 'inpressuom',
        Maximum: 'inpressmax',
        Normal: 'inpressnorm',
        Minimum: 'inpressmin'
      },
      4: {
        Units: 'pressuredropuom',
        Maximum: 'pressuredropmax',
        Normal: 'pressuredropnorm',
        Minimum: 'pressuredropmin'
      },
      5: {
        Units: 'intempuom',
        Maximum: 'intempmax',
        Normal: 'intempnorm',
        Minimum: 'intempmin'
      },
      6: [
        {
          Units: 'densityuom',
          Maximum: 'densitymax',
          Normal: 'densitynorm',
          Minimum: 'densitymin'
        },
        {
          Units: 'specificgravityuom',
          Maximum: 'specificgravitymax',
          Normal: 'specificgravitynorm',
          Minimum: 'specificgravitymin'
        }
      ],
      7: [
        {
          Units: 'specheatratiouom',
          Maximum: 'specheatratiomax',
          Normal: 'specheatrationorm',
          Minimum: 'specheatratiomin'
        },
        {
          Units: 'viscosityuom',
          Maximum: 'viscositymax',
          Normal: 'viscositynorm',
          Minimum: 'viscositymin'
        }
      ],
      8: [
        {
          Units: 'specvaporpressuom',
          Maximum: 'specvaporpressmax',
          Normal: 'specvaporpressnorm',
          Minimum: 'specvaporpressmin'
        },
        {
          Units: 'viscosityuom',
          Maximum: 'viscositymax',
          Normal: 'viscositynorm',
          Minimum: 'viscositymin'
        }
      ],
      9: { Maximum: 'reqcvmax', Normal: 'reqcvnorm', Minimum: 'reqcvmin' },
      11: [
        {
          Units: 'allowspluom',
          Maximum: 'allowsplmax',
          Normal: 'allowsplnorm',
          Minimum: 'allowsplmin'
        },

        {
          Units: 'predictspluom',
          Maximum: 'predictsplmaxvalueonly',
          Normal: 'predictsplnormvalueonly',
          Minimum: 'predictsplminvalueonly'
        }
      ],
      13: objFrom13 =>
        handleSzSchedMap(
          objFrom13,
          [
            'Size, Schedule In:',
            'Size, ScheduleIn:',
            'Size,ScheduleIn:',
            'Size, Schedule In:'
          ],
          ['inendconnsize', 'inendconnsched']
        ),
      14: objFrom14 =>
        handleSzSchedMap(
          objFrom14,
          ['Size, Schedule Out:', 'Size, ScheduleOut:', 'Size,ScheduleOut:'],
          ['outpipelinesize', 'outpipelinesched']
        ),
      16: { pageDataKey: 'Type:', mappingKey: 'valvebodytype' },
      17: objFrom17 =>
        handleMappingWithSplit(objFrom17, 'Size:', 'ANSI', [
          'valvebodysize',
          'valvebodyansiclass',
          'valvebodysizeuom'
        ]),
      18: objFrom18 => {
        const mappingKey = ['Max Press/Temp:', 'MaxPress/Temp:'].filter(
          key => objFrom18[key]
        )[0];
        if (!mappingKey) {
          return {
            maxpress: '',
            maxpressuom: '',
            maxtemp: '',
            maxtempuom: ''
          };
        }
        const splitStr = objFrom18[mappingKey].split('/');
        const splitPress = splitStr[0].split(' ');
        const maxpress = splitPress[0];
        const maxpressuom = splitPress[1];
        let maxtemp;
        let maxtempuom;
        if (splitStr[1]) {
          const splitTemp = splitStr[1].split(' ');
          maxtemp = parseInt(splitTemp[0].replace(/[^0-9.]+/g, ''), 10);
          maxtempuom = splitStr[1].replace(/[0-9]/g, '').substring(1);
        }
        return {
          maxpress,
          maxpressuom,
          maxtemp,
          maxtempuom
        };
      },
      19: objFrom19 =>
        handleMappingWithSplit(objFrom19, 'Mfg/Model:', '/', [
          'valvemfr',
          'valvemodel'
        ]),
      20: { pageDataKey: 'Body/Bonnet Matl:', mappingKey: 'bodymatl' },
      22: objFrom22 =>
        handleEndCnnctMap(
          objFrom22,
          ['End Connection In:', 'End ConnectionIn:'],
          ['inendconn', 'inendconnrating']
        ),
      23: objFrom23 =>
        handleEndCnnctMap(
          objFrom23,
          ['End Connection Out:', 'End ConnectionOut:'],
          ['outendconn', 'outendconnrating']
        ),
      26: { pageDataKey: 'Flow Direction:', mappingKey: 'flowdirection' },
      27: { pageDataKey: 'BONNET Type:', mappingKey: 'bonnettype' },
      28: [
        ['Lub-Iso Valve:', 'Lube:'],
        ['lubisovalve', 'lube']
      ],
      29: { pageDataKey: 'Packing Material:', mappingKey: 'packingmatl' },
      30: { pageDataKey: 'Packing Type:', mappingKey: 'packingtype' },
      32: { pageDataKey: 'TRIM Type:', mappingKey: 'trimtype' },
      34: { pageDataKey: 'Characteristic:', mappingKey: 'trimcharacter' },
      43: [
        ['NEC Class:', 'Group:', 'Div:'],
        ['necclass', 'necgroup', 'necdiv']
      ],
      54: objFrom54 =>
        handleMappingWithSplit(objFrom54, 'Mfg/Model:', '/', [
          'actuatormfr',
          'actuatormodel'
        ]),
      55: { pageDataKey: 'Size:', mappingKey: 'actuatorsize' },
      61: [
        ['Max:', 'Min:'],
        [
          'maxavailairsupplypress',
          'minavailairsupplypress',
          'availairsupplypressuom'
        ]
      ],
      65: [
        ['Air Failure Valve:'],
        ['airfailvalvepress', 'airfailvalvepressuom']
      ],
      67: objFrom67 => {
        const mappingKey = ['Input Signal:', 'InputSignal:'].filter(
          key => objFrom67[key]
        )[0];
        const splitStr = objFrom67[mappingKey].split('to');
        const inputSignalNum = parseInt(splitStr[0], 10);
        const output = {
          inputsignaluom: null,
          inputsignalmin: null,
          inputsignalmax: null
        };
        if (isNaN(inputSignalNum)) {
          [output.inputsignaluom] = splitStr;
        } else {
          output.inputsignalmin = inputSignalNum;
        }
        if (splitStr[1]) {
          const splitMaxOum = splitStr[1].replace(' ', '');
          output.inputsignalmax = parseInt(
            splitMaxOum.replace(/[^\d.-]/g, ''),
            10
          );
          output.inputsignaluom = splitMaxOum
            .replace(/[0-9]/g, '')
            .substring(1);
        }
        return output;
      },
      69: objFrom69 =>
        handleMappingWithSplit(objFrom69, 'Mfg/Model:', '/', [
          'positionermfr',
          'positionermodel'
        ]),
      70: {
        pageDataKey: 'Incr Signal Output:',
        mappingKey: 'signaloutincrdecr'
      },
      71: [
        ['Gauges:', 'By-Pass:'],
        ['airpressgaugeind', 'positionerbypassind']
      ],
      72: { pageDataKey: 'Cam Characteristic:', mappingKey: 'camcharacter' },
      79: objFrom79 =>
        handleMappingWithSplit(objFrom79, 'Mfg/Model:', '/', [
          'airsetmfr',
          'airsetmodel'
        ]),
      81: [
        ['Filter:', 'Gauges:'],
        ['airsetfilterind', 'airsetgaugeind']
      ],
      83: { pageDataKey: 'TESTS Hydro Press:', mappingKey: 'hydropresstest' },
      84: { pageDataKey: 'ANSI/FCI Leak Class:', mappingKey: 'leakageclass' }
    };

    const otherDataOutput = Object.keys(pageData.otherData).map(key => {
      if (typeof format[key] === 'function') {
        return format[key](pageData.otherData[key]);
      }
      if (typeof format[key] === 'object') {
        if (!Array.isArray(format[key])) {
          const { pageDataKey, mappingKey } = format[key];
          return handleMapping(
            pageDataKey,
            pageData.otherData[key],
            mappingKey
          );
        }
        return handleMapping(
          format[key][0],
          pageData.otherData[key],
          format[key][1]
        );
      }
    });

    const tableDataOutput = pageData.tableData.map((dataObj, key) => {
      key += 1;
      if (format[key]) {
        if (typeof format[key] === 'function') {
          return format[key](dataObj);
        }
        return handleTableDataMap(dataObj, format[key]);
      }
    });

    const { itemtag } = pageData.otherData;

    const combinedOutput = otherDataOutput.concat(tableDataOutput);
    return combinedOutput.reduce(
      (output, obj) => {
        if (!obj) {
          return output;
        }
        Object.keys(obj).forEach(key => {
          if (obj[key] === '|') {
            obj[key] = null;
          }
        });
        return Object.assign(output, obj);
      },
      { itemtag }
    );
  }
};
