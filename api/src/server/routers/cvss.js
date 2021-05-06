const express = require('express');
const {
  cvssHelpers,
} = require('../../database/helpers');

const {
  findCVSSByTag,
  createCVSSEntry,
  updateCVSSEntry,
  findAllCVSSEntries,
} = cvssHelpers;

const cvss = express.Router();

cvss.get('/', async (req, res) => {
  try {
    res.status(200).send({ allCVSS: await findAllCVSSEntries() });
  } catch (error) {
    res.status(500).send({ error, msg: 'Error finding resources' });
  }
});

cvss.get('/:tag', async (req, res) => {
  try {
    res.status(200).send({ cvss: await findCVSSByTag(req.params.tag) });
  } catch (error) {
    res.status(500).send({ error, msg: 'Error finding resource' });
  }
});

cvss.post('/', async (req, res) => {
  try {
    res.status(201).send({ newCVSSEntry: await createCVSSEntry(req.body) });
  } catch (error) {
    res.status(500).send({ error, msg: 'Error creating resource' });
  }
});

cvss.put('/', async (req, res) => {
  try {
    res.status(201).send({ updatedCVSSEntry: await updateCVSSEntry(req.body) });
  } catch (error) {
    res.status(500).send({ error, msg: 'Error updating resource' });
  }
});

module.exports = cvss;
