var express = require('express');
var wagner = require('wagner-core');

//Init wagner factories
require('./models')(wagner);

var app = express();

//Call auth function with app parameter set to app
wagner.invoke(require('./auth'), {app: app});

//Init API subrouter
app.use('/api/v1', require('./api')(wagner));

//Start the server
app.listen(3000);
console.log('Listening on port 3000...');
