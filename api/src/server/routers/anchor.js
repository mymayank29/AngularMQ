const express = require('express');
const { anchorHelpers } = require('../../database/helpers');

const {
  findAnchorByTag,
  createAnchorEntry,
  updateAnchorEntry,
  findAllAnchorEntries,
} = anchorHelpers;

const anchor = express.Router();

anchor.get('/', async (req, res) => {
  try {
    res.status(200).send({ allAnchorEntries: await findAllAnchorEntries() });
  } catch (error) {
    res.status(500).send({ error, msg: 'Error finding resources' });
  }
});

anchor.get('/:tag', async (req, res) => {
  try {
    res
      .status(200)
      .send({ anchorEntry: await findAnchorByTag(req.params.tag) });
  } catch (error) {
    res.status(500).send({ error, msg: 'Error finding resource' });
  }
});

anchor.post('/', async (req, res) => {
  try {
    res.status(201).send({ newAnchorEntry: await createAnchorEntry(req.body) });
  } catch (error) {
    res.status(500).send({ error, msg: 'Error creating resource' });
  }
});

anchor.put('/', async (req, res) => {
  try {
    res
      .status(201)
      .send({ updatedAnchorEntry: await updateAnchorEntry(req.body) });
  } catch (error) {
    res.status(500).send({ error, msg: 'Error updating resource' });
  }
});

module.exports = anchor;
