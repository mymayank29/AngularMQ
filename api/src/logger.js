/**
 * take in JSON report containing fileName and data or error
 * write to run logfile JSON report
 *
 */

const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { RUN_LOG_FILE, ERROR_LOG_FILE } = process.env;

const logFileReport = fileReport => {
  const reportLine = `${fileReport}
  `;
  const logFile = RUN_LOG_FILE;
  if (JSON.parse(fileReport)) {
    fs.appendFileSync(logFile, reportLine);
  }
};

const logError = (fileReport, fileName) => {
  const time = new Date();
  const reportLine = `${fileName}
  ${time}
  ${fileReport}
  
`;
  const errorFile = ERROR_LOG_FILE;
  fs.appendFileSync(errorFile, reportLine);
};

module.exports = {
  logFileReport,
  logError
};
