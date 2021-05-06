const cvssRouter = require('./cvss');
const anchorRouter = require('./anchor');
const triggerRouter = require('./trigger');
const uploadRouter = require('./upload');
const reportRouter = require('./report');

module.exports = app => {
  app.use('/cvss', cvssRouter);
  app.use('/anchor', anchorRouter);
  app.use('/trigger', triggerRouter);
  app.use('/upload', uploadRouter);
  app.use('/report', reportRouter);
};
