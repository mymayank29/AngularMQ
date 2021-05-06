// During the test the env variable is set to test
process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const chai = require('chai');

const { expect } = chai;
const supertest = require('supertest');
const chaiHttp = require('chai-http');

const fileData = require('../parsedObjects').anchor1;
const { destroy, anchorHelpers } = require('../../src/database/helpers');
const { server } = require('../../src/server/server');

const { createAnchorEntry } = anchorHelpers;

chai.use(chaiHttp);

describe('AnchorSheet', () => {
  beforeEach(done => {
    try {
      destroy('AnchorSheet').then(async () => {
        await createAnchorEntry(fileData);
        done();
      });
    } catch (err) {
      console.log(err);
    }
  });

  describe('/GET /anchor/', () => {
    it('it should GET all Anchor Entries', done => {
      supertest(server)
        .get('/anchor')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.allAnchorEntries).to.be.an('array');
          expect(res.body.allAnchorEntries).to.have.a.lengthOf(1);
          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });
  });
});
