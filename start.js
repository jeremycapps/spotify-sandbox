const app = require('./server/server');


const server = app.listen(app.get('port'), () => {
  console.log(`Starting server at ${(new Date()).toString()}`);
  console.log(`Server listening on port: ${server.address().port}`);
});
