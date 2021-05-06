const express = require('express');

const { runFile } = require('../../queue');

const trigger = express.Router();

trigger.post('/', async (req, res) => {
  try {
    const { fileURL } = req.body;
    const fileData = await runFile(fileURL);
    if (fileData.error) {
      res.status(fileData.error[0]).send({ error: fileData.error[1] });
    } else {
      res.status(201);
      res.end();
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error, msg: 'Error creating resource' });
  }
});

module.exports = trigger;
