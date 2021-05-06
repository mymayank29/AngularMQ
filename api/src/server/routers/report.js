const express = require('express');

const { generateReport } = require('../../reports');

const report = express.Router();

report.get('/', async (req, res) => {
  try {
    const gridOptions = await generateReport();
    res.status(200).send({ gridOptions });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error, msg: 'Error creating resource' });
  }
});

module.exports = report;
