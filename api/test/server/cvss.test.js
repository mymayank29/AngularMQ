// During the test the env variable is set to test
process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const chai = require('chai');

const { expect } = chai;
const supertest = require('supertest');
const chaiHttp = require('chai-http');

const fileData = require('../parsedObjects').JSM213021;
const { destroy, cvssHelpers } = require('../../src/database/helpers');
const { server } = require('../../src/server/server');

const { createCVSSEntry } = cvssHelpers;

chai.use(chaiHttp);

describe('ControlValveSpecSheet', () => {
  beforeEach(done => {
    try {
      destroy('ControlValveSpecSheet').then(async () => {
        await createCVSSEntry(fileData);
        done();
      });
    } catch (err) {
      console.log(err);
    }
  });

  describe('/GET /cvss/', () => {
    it('it should GET all Control Valve Spec Sheets', done => {
      supertest(server)
        .get('/cvss')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.allCVSS).to.be.an('array');
          expect(res.body.allCVSS).to.have.a.lengthOf(1);
          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });
  });
});
