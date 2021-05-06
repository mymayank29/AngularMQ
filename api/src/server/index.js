const { server } = require('./server');
const { PORT } = require('./config');
console.log('PORT', PORT);

server.listen(PORT, '0.0.0.0', function() {
  const a = this.address();
  console.log('listening on %s:%s', a.address, a.port);
});
