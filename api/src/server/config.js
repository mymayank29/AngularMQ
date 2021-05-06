const dotenv = require('dotenv');

dotenv.config();
const { env } = process;
const { PORT } = env;

// const PROD = process.env.NODE_ENV === 'production';
// const DEV = !PROD;

module.exports = {
  PORT: PORT || 8080, env,
};
