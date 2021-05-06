/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
const pdfjs = require('pdfjs-dist');

const { formatData } = require('./formatPDF');

const getNearestCol = (headers, value) =>
  Object.keys(headers).reduce((nearestCol, col) =>
    Math.abs(value.col - col) < Math.abs(value.col - nearestCol)
      ? col
      : nearestCol
  );

const sanitizeStr = line =>
  line
    .trim()
    .replace(/\s\s\s+/g, '')
    .replace(/\s\s+/g, ' ');

const getCritPresPC = lineSplitAtColon =>
  lineSplitAtColon[lineSplitAtColon.length - 1].split(' ').reduce(
    (critPresPC, item, i, a) => {
      if (i === a.length - 1) {
        critPresPC.units = item;
      } else {
        critPresPC.value += Number(item);
      }
      return critPresPC;
    },
    {
      units: '',
      value: 0
    }
  );

const getType = lineSplitAtColon => ({
  type: `${lineSplitAtColon[0]
    .split(' ')
    .slice(1)}${lineSplitAtColon[1].replace(' Crit. Pres. PC', '')}`,
  Crit_Pres_PC: getCritPresPC(lineSplitAtColon)
});

const getTableData = (lineArr, headers) =>
  lineArr.reduce((output, value, i) => {
    const lineData = value.sanitizedStr
      .split(' ')
      .slice(1)
      .join(' ');
    if (headers[value.col]) {
      if (i === 0) {
        if (lineData !== '') {
          output[headers[value.col]] = lineData;
        }
      } else {
        output[headers[value.col]] = value.sanitizedStr;
      }
    } else {
      const nearestCol = getNearestCol(headers, value);

      if (i === 0) {
        if (lineData !== '') {
          output[headers[nearestCol]] = lineData;
        }
      } else {
        output[headers[nearestCol]] = value.sanitizedStr;
      }
    }
    return output;
  }, {});

const setFields = (fields, key, wordGrouping, prevKey) => {
  if (!prevKey) {
    const splitGroup = wordGrouping.sanitizedStr.split(':');
    if (splitGroup.length > 1) {
      fields[key][splitGroup[0]] = splitGroup[1];
    } else {
      fields[key].string += ` ${splitGroup[0]}`;
    }
  } else if (wordGrouping.sanitizedStr !== prevKey) {
    fields[key][prevKey] += wordGrouping.sanitizedStr;
  }
  return fields;
};

const getFields = (lineArr, column1, column2) => {
  let fields = { string: '' };
  let leftKey = 'string';
  let rightKey = 'string';
  let prevKey;
  let onRightColumn = false;

  lineArr.forEach(wordGrouping => {
    if (wordGrouping.col === column1) {
      leftKey = wordGrouping.sanitizedStr;
      if (leftKey.length > 2) {
        leftKey = wordGrouping.sanitizedStr.slice(0, 2);
        wordGrouping.sanitizedStr = wordGrouping.sanitizedStr.slice(2);
        fields[leftKey] = { string: '' };

        if (
          wordGrouping.sanitizedStr[wordGrouping.sanitizedStr.length - 1] ===
          ':'
        ) {
          prevKey = wordGrouping.sanitizedStr;
          fields[leftKey][prevKey] = '';
        }

        fields = Object.assign(
          fields,
          setFields(fields, leftKey, wordGrouping, prevKey)
        );
      } else {
        fields[leftKey] = { string: '' };
      }
    }

    if (wordGrouping.col > column1 && wordGrouping.col < column2) {
      if (
        wordGrouping.sanitizedStr[wordGrouping.sanitizedStr.length - 1] === ':'
      ) {
        prevKey = wordGrouping.sanitizedStr;
        fields[leftKey][prevKey] = '';
      }

      fields = Object.assign(
        fields,
        setFields(fields, leftKey, wordGrouping, prevKey)
      );
    }

    if (wordGrouping.col >= 324 && !onRightColumn) {
      prevKey = null;
      onRightColumn = true;
    }

    if (wordGrouping.col === column2) {
      rightKey = wordGrouping.sanitizedStr;
      if (rightKey.length > 2 && rightKey !== 'Rev') {
        rightKey = wordGrouping.sanitizedStr.slice(0, 2);
        wordGrouping.sanitizedStr = wordGrouping.sanitizedStr.slice(2);
        fields[rightKey] = { string: '' };

        if (
          wordGrouping.sanitizedStr[wordGrouping.sanitizedStr.length - 1] ===
          ':'
        ) {
          prevKey = wordGrouping.sanitizedStr;
          fields[rightKey][prevKey] = '';
        }

        fields = Object.assign(
          fields,
          setFields(fields, rightKey, wordGrouping, prevKey)
        );
      } else {
        fields[wordGrouping.sanitizedStr] = { string: '' };
      }
    }
    if (wordGrouping.col > column2) {
      if (
        wordGrouping.sanitizedStr[wordGrouping.sanitizedStr.length - 1] === ':'
      ) {
        prevKey = wordGrouping.sanitizedStr;

        fields[rightKey][prevKey] = '';
      }
      fields = Object.assign(
        fields,
        setFields(fields, rightKey, wordGrouping, prevKey)
      );
    }
  });
  return fields;
};

const getTag = lineArr => {
  const tagLine = [];
  let dateIndex = false;
  lineArr.forEach((line, i) => {
    if (line.sanitizedStr.startsWith('Da')) {
      dateIndex = true;
    }
    if (!dateIndex && i !== 0) {
      tagLine.push(line.sanitizedStr);
    }
  });
  return { itemtag: tagLine.join(' ') };
};

const getRevision = (lineArr, revHeaders, column2) => {
  const workingLine = lineArr.slice(1).reduce((line, item) => {
    if (item.col > column2) {
      line.push(item);
    }
    return line;
  }, []);
  const revision = {};
  if (workingLine.length !== 0) {
    if (workingLine[0].sanitizedStr.length < 3) {
      revision.Rev = workingLine[0].sanitizedStr;
      revision.Date = workingLine[1].sanitizedStr;
    } else {
      const splitAtSlash = workingLine[0].sanitizedStr.split('/');
      const revFromError = splitAtSlash[0].slice(0, splitAtSlash[0].length - 2);
      const dateFromError = `${splitAtSlash[0].slice(
        splitAtSlash[0].length - 2
      )}/${splitAtSlash[1]}/${splitAtSlash[2].slice(0, 2)}`;
      revision.Rev = revFromError;
      revision.Date = dateFromError;
    }
  }
  return revision;
};

const parseLine = (
  lineArr,
  currentOutput,
  row,
  bottomBorder,
  topBorder,
  headers,
  column1,
  column2,
  revisionHeaders,
  prevNumKey
) => {
  const { otherData } = currentOutput;
  if (lineArr[0].sanitizedStr.startsWith('Tags')) {
    const tag = getTag(lineArr);
    currentOutput.otherData = Object.assign(otherData, tag);
  }
  const line = lineArr.reduce((line, item, i) => {
    line += `${item.sanitizedStr} `;
    if (i === lineArr.length - 1) {
      line = line.slice(0, line.length - 1);
    }
    return line;
  }, '');
  const lineSplitAtColon = line.split(':');
  if (row >= bottomBorder && row <= topBorder) {
    if (
      !line.startsWith(`${prevNumKey.toString()} `) &&
      !line.startsWith(`${(prevNumKey + 1).toString()} `) &&
      line !== '12' &&
      prevNumKey !== 1 &&
      prevNumKey !== 0 &&
      !line.startsWith('1')
    ) {
      lineArr.forEach(extraData => {
        const nearestCol = getNearestCol(headers, extraData);
        currentOutput.tableData[prevNumKey - 1][headers[nearestCol]] +=
          extraData.sanitizedStr;
      });
    }
    if (line.startsWith(`${(prevNumKey + 1).toString()}`)) {
      if (prevNumKey + 1 === 1 && currentOutput.tableData[0].type === '') {
        currentOutput.tableData[0] = getType(lineSplitAtColon);
      }
      if (prevNumKey + 1 !== 1) {
        currentOutput.tableData[prevNumKey] = getTableData(lineArr, headers);
      }
      prevNumKey += 1;
    }
  } else if (Number(lineArr[0].sanitizedStr) > 53) {
    const revision = getRevision(lineArr, revisionHeaders, column2);
    if (revision.Rev) {
      currentOutput.revisions.push(revision);
    }
  } else if (bottomBorder > row) {
    const lineObject = getFields(lineArr, column1, column2);
    currentOutput.otherData = Object.assign(otherData, lineObject);
  }
  return prevNumKey;
};

const getBorderAndHeaders = (keys, page) => {
  let startColumnHeaderRow = false;
  let stopColumnHeaderRow = false;
  const borderAndHeaders = keys.reduce(
    (output, row) => {
      const { bottomBorder, topBorder, headers } = output;
      row = Number(row);
      if (
        page[row][0].sanitizedStr === '2' ||
        page[row][0].sanitizedStr.startsWith('2 ')
      ) {
        stopColumnHeaderRow = true;
        const finalHeaders = [];

        if (Array.isArray(headers)) {
          headers.forEach((item, i) => {
            const { sanitizedStr } = item;
            if (
              sanitizedStr.endsWith('x') ||
              sanitizedStr.endsWith('@') ||
              sanitizedStr.endsWith('E') ||
              sanitizedStr === 'Case'
            ) {
              const finalHeader = { ...item };
              finalHeader.sanitizedStr = `${sanitizedStr} `;
              finalHeaders[i + 1] = finalHeader;
            } else if (finalHeaders[i]) {
              finalHeaders[i].sanitizedStr += sanitizedStr;
            } else {
              finalHeaders[i] = item;
            }
          });
          output.headers = finalHeaders.reduce((outputHeaders, item) => {
            if (item) {
              const { sanitizedStr } = item;
              item.sanitizedStr = sanitizedStr
                .replace(/\s+/g, '_')
                .replace(/:/g, '');
              outputHeaders[~~item.col] = item.sanitizedStr;
            }
            return outputHeaders;
          }, {});
        }
      }
      if (startColumnHeaderRow && !stopColumnHeaderRow) {
        output.headers = headers.concat(page[row]);
      }
      if (topBorder === 0) {
        if (
          page[row][0].sanitizedStr === '1' ||
          page[row][0].sanitizedStr.startsWith('1')
        ) {
          output.topBorder = row;
          startColumnHeaderRow = true;
        }
      }

      if (bottomBorder === 0) {
        if (
          page[row][0].sanitizedStr === '12' ||
          page[row][0].sanitizedStr.startsWith('12 ')
        ) {
          output.bottomBorder = row;
        }
      }
      if (page[row][0].sanitizedStr === '47') {
        const revHeaders = page[row].slice(1);
        if (revHeaders[0].sanitizedStr === 'Rev Date') {
          revHeaders.shift();
          revHeaders.unshift({ sanitizedStr: 'Date' });
          revHeaders.unshift({ sanitizedStr: 'Rev', col: 320 });
        }
        output.revisionHeaders = revHeaders;
      }
      return output;
    },
    {
      bottomBorder: 0,
      headers: [],
      topBorder: 0,
      revisionHeaders: []
    }
  );
  return borderAndHeaders;
};

const parseRows = page => {
  const pageObject = page.items.reduce((rowStrObj, currentItem) => {
    let [, , , , col, row] = currentItem.transform;
    row = ~~row;
    col = ~~col;
    let sanitizedStr = sanitizeStr(currentItem.str);
    if (sanitizedStr === '/') {
      return rowStrObj;
    }
    let app = null;
    let date = null;
    if (sanitizedStr.includes('OrigA')) {
      sanitizedStr = 'Orig';
      app = 'App';
    }

    if (sanitizedStr.includes('RevD')) {
      sanitizedStr = 'Rev';
      date = 'Date';
    }

    if (sanitizedStr === '') {
      return rowStrObj;
    }
    if (rowStrObj[row + 2]) {
      rowStrObj[row + 2].push({
        sanitizedStr,
        col
      });
    } else if (rowStrObj[row - 2]) {
      rowStrObj[row - 2].push({
        sanitizedStr,
        col
      });
    } else if (rowStrObj[row + 1]) {
      rowStrObj[row + 1].push({
        sanitizedStr,
        col
      });
    } else if (rowStrObj[row - 1]) {
      rowStrObj[row - 1].push({
        sanitizedStr,
        col
      });
    } else if (!rowStrObj[row]) {
      rowStrObj[row] = [
        {
          sanitizedStr,
          col
        }
      ];
    } else {
      rowStrObj[row].push({
        sanitizedStr,
        col
      });
      if (app) {
        rowStrObj[row].push({ sanitizedStr: app });
      }
      if (date) {
        rowStrObj[row].push({ sanitizedStr: date });
      }
    }

    if (rowStrObj[row]) {
      rowStrObj[row].sort((a, b) => a.col - b.col);
    }

    return rowStrObj;
  }, {});
  return pageObject;
};

const parsePage = page =>
  page.getTextContent().then(content => {
    const pageObject = parseRows(content);

    let keysInOrder = Object.keys(pageObject).sort((a, b) => b - a);

    const {
      bottomBorder,
      headers,
      topBorder,
      revisionHeaders
    } = getBorderAndHeaders(keysInOrder, pageObject);
    let column1;
    let column2;
    const assignCol2 = pageRow => {
      pageRow.forEach(word => {
        // eslint-disable-next-line use-isnan
        if (
          Number(word.sanitizedStr) === 53 ||
          Number(word.sanitizedStr.slice(0, 2)) === 53
        ) {
          column2 = word.col;
        }
      });
    };

    const orderedPageObj = Object.keys(pageObject).reduce(
      // eslint-disable-next-line no-shadow
      (orderedPageObj, row) => {
        if (row >= bottomBorder && row <= topBorder) {
          orderedPageObj[row] = Object.values(
            pageObject[row].reduce((orderedRowObj, item) => {
              const nearestCol = getNearestCol(headers, item);
              if (Math.abs(item.col - parseInt(nearestCol)) > 60) {
                return orderedRowObj;
              }
              if (!orderedRowObj[nearestCol]) {
                orderedRowObj[nearestCol] = item;
              } else {
                orderedRowObj[
                  nearestCol
                ].sanitizedStr += ` ${item.sanitizedStr}`;
              }
              return orderedRowObj;
            }, {})
          );
        } else {
          if (
            pageObject[row][0].sanitizedStr.startsWith('PIPE') ||
            pageObject[row][0].sanitizedStr.startsWith('PI PE')
          ) {
            assignCol2(pageObject[row]);
          }
          if (pageObject[row][0].sanitizedStr.startsWith('13')) {
            column1 = pageObject[row][0].col;
          }
          if (pageObject[row][1]) {
            if (
              pageObject[row][1].sanitizedStr.startsWith('PIPE') ||
              pageObject[row][1].sanitizedStr.startsWith('PI PE')
            ) {
              assignCol2(pageObject[row]);
            }
          }

          if (pageObject[row].length === 1 && pageObject[parseInt(row) + 11]) {
            if (
              pageObject[parseInt(row) + 11][2].col === pageObject[row][0].col
            ) {
              pageObject[
                parseInt(row) + 11
              ][2].sanitizedStr += ` ${pageObject[row][0].sanitizedStr}`;
              keysInOrder = keysInOrder.filter(key => key !== row);
              return orderedPageObj;
            }
            if (
              pageObject[parseInt(row) + 11][1].col === pageObject[row][0].col
            ) {
              pageObject[
                parseInt(row) + 11
              ][1].sanitizedStr += ` ${pageObject[row][0].sanitizedStr}`;
              keysInOrder = keysInOrder.filter(key => key !== row);
              return orderedPageObj;
            }
            if (
              pageObject[parseInt(row) + 11][2].col === pageObject[row][0].col
            ) {
              pageObject[
                parseInt(row) + 10
              ][2].sanitizedStr += ` ${pageObject[row][0].sanitizedStr}`;
              keysInOrder = keysInOrder.filter(key => key !== row);
              return orderedPageObj;
            }
            if (
              pageObject[parseInt(row) + 11][1].col === pageObject[row][0].col
            ) {
              pageObject[
                parseInt(row) + 10
              ][1].sanitizedStr += ` ${pageObject[row][0].sanitizedStr}`;
              keysInOrder = keysInOrder.filter(key => key !== row);
              return orderedPageObj;
            }
          }
          orderedPageObj[row] = pageObject[row];
        }
        return orderedPageObj;
      },
      {}
    );
    let prevNumKey = 0;
    const pageData = keysInOrder.reduce(
      (outputData, row) => {
        prevNumKey = parseLine(
          orderedPageObj[row],
          outputData,
          Number(row),
          bottomBorder,
          topBorder,
          headers,
          column1,
          column2,
          revisionHeaders,
          prevNumKey
        );
        return outputData;
      },
      {
        tableData: [
          {
            type: '',
            Crit_Pres_PC: {
              value: 0,
              units: ''
            }
          }
        ],
        revisions: [],
        otherData: {}
      }
    );
    return formatData(pageData);
  });

const parsePdf = async (pdf, pageNumber) =>
  pdf.getPage(pageNumber).then(parsePage);

const readPDF = (filePath, pageNum) =>
  pdfjs
    .getDocument(filePath)
    .promise.then(file => parsePdf(file, pageNum))
    .catch(err => console.log(err));

module.exports = {
  readPDF
};
