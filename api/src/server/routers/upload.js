const express = require('express');

const Upload = express.Router();

Upload.post('/', async (req, res) => {
  try {
    res.status(200).send({});
  } catch (error) {
    console.log(error);
    res.status(500).send({ error, msg: 'Error uploading' });
  }
});

module.exports = Upload;
